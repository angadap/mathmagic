// api/admin.js
import { createHash } from "crypto";
// Admin-only API (schools, teachers, students, questions, home users)

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_HASH = "ab2da7525c00b97df6fc54fa82adc3c7dbe8345e6e4f621ce2f699994efd61be";

const ALLOWED  = ["https://mathmagic-virid.vercel.app","http://localhost:5173","http://localhost:3000"];
const UUID_RE  = /^[0-9a-f-]{36}$/i;
const isUUID   = s => UUID_RE.test(s||"");
const clean    = (s,n=100) => typeof s==="string" ? s.replace(/[<>]/g,"").slice(0,n).trim() : "";
const cleanInt = (n,min,max) => { const i=parseInt(n); return isNaN(i)?min:Math.min(Math.max(i,min),max); };

const rl = new Map();
function rateLimit(ip, max=60, ms=60000) {
  const now=Date.now(), e=rl.get(ip)||{c:0,r:now+ms};
  if(now>e.r){e.c=0;e.r=now+ms;} e.c++; rl.set(ip,e);
  return e.c>max ? {limited:true,retryAfter:Math.ceil((e.r-now)/1000)} : {limited:false};
}

async function sb(table, method, body, params="") {
  const headers = {
    apikey:SB_SERVICE, Authorization:`Bearer ${SB_SERVICE}`,
    "Content-Type":"application/json",
    Prefer: method==="POST"?"return=representation":"return=minimal",
  };
  if (method==="GET") headers["Range-Unit"]="items", headers["Range"]="0-99999", headers["Prefer"]="count=none";
  const r = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method, headers, body: body?JSON.stringify(body):undefined
  });
  const t = await r.text();
  try { return {ok:r.ok, data:JSON.parse(t)}; } catch { return {ok:r.ok, data:t}; }
}

async function sbAll(table, params="") {
  const PAGE = 1000;
  let all = [], from = 0;
  while (true) {
    const headers = {
      apikey:SB_SERVICE, Authorization:`Bearer ${SB_SERVICE}`,
      "Content-Type":"application/json",
      "Range-Unit":"items", "Range":`${from}-${from+PAGE-1}`,
      "Prefer":"count=none",
    };
    const sep = params.includes("?") ? "&" : "?";
    const r = await fetch(`${SB_URL}/rest/v1/${table}${params}${sep}limit=${PAGE}&offset=${from}`, {method:"GET",headers});
    const t = await r.text();
    let rows;
    try { rows=JSON.parse(t); } catch { return {ok:false,data:[],error:"parse_fail:"+t.slice(0,100)}; }
    if (!Array.isArray(rows)) return {ok:false,data:[],error:"not_array:"+JSON.stringify(rows).slice(0,200)};
    if (rows.length===0) break;
    all = all.concat(rows);
    if (rows.length < PAGE) break;
    from += PAGE;
    if (all.length > 50000) break;
  }
  return {ok:true, data:all};
}

function hashPin(pin) {
  return createHash("sha256").update("mm_school_"+pin).digest("hex");
}

export default async function handler(req, res) {
  const origin = req.headers.origin||"";
  if (ALLOWED.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Cache-Control","no-store");

  if (req.method==="OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
    return res.status(200).end();
  }
  if (req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()||"unknown";
  const {limited,retryAfter} = rateLimit(ip);
  if (limited) return res.status(429).json({error:`Rate limit. Wait ${retryAfter}s.`});

  const {action} = req.body||{};
  if (!action) return res.status(400).json({error:"Missing action"});

  // Auth check
  const authHeader = req.headers.authorization||"";
  const _incoming = authHeader.replace("Bearer ","").trim();
  if (createHash("sha256").update(_incoming).digest("hex") !== ADMIN_HASH)
    return res.status(403).json({error:"Forbidden"});

  try {
      // Create school
      if (action==="admin_create_school") {
        const name = clean(req.body.name, 100);
        const city = clean(req.body.city, 50);
        const school_code = clean(req.body.school_code, 20).toUpperCase();
        if (!name||!city||!school_code) return res.status(400).json({error:"Missing fields"});
        const r = await sb("schools","POST",{name,city,school_code,is_active:true});
        if (!r.ok) return res.status(400).json({error:"School code may already exist"});
        return res.status(200).json({data: Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Update school code
      if (action==="admin_update_school") {
        const {school_id, school_code, name, city, is_active} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const update = {};
        if (school_code) update.school_code = clean(school_code,20).toUpperCase();
        if (name)        update.name        = clean(name,100);
        if (city)        update.city        = clean(city,50);
        if (is_active !== undefined) update.is_active = !!is_active;
        const r = await sb("schools","PATCH",update,`?id=eq.${school_id}`);
        return res.status(200).json({ok:r.ok});
      }

      // List all schools
      if (action==="admin_list_schools") {
        const r = await sbAll("schools","?order=created_at.desc");
        return res.status(200).json({data:r.data});
      }

      // Create teacher
      if (action==="admin_create_teacher") {
        const {school_id, name, email, pin, permissions} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        if (!email||!pin||!name) return res.status(400).json({error:"Missing fields"});
        const pin_hash = hashPin(String(pin).slice(0,6));
        const validPerms = ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"];
        const perms = Array.isArray(permissions) ? permissions.filter(p=>validPerms.includes(p)) : [];
        const r = await sb("teachers","POST",{
          school_id, name:clean(name,50),
          email:clean(email,100).toLowerCase(),
          pin_hash, is_active:true, permissions:perms
        });
        if (!r.ok) return res.status(400).json({error:"Email may already exist"});
        return res.status(200).json({data: Array.isArray(r.data)?r.data[0]:r.data});
      }

      // List ALL teachers across all schools (for dashboard tiles)
      if (action==="admin_list_all_teachers") {
        const {search, school_id} = req.body;
        let params = "?select=id,name,email,school_id,permissions,is_active,created_at&order=created_at.desc";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        const r = await sbAll("teachers",params);
        let data = r.data||[];
        if (search) { const s=search.toLowerCase(); data=data.filter(t=>t.name?.toLowerCase().includes(s)||t.email?.toLowerCase().includes(s)); }
        return res.status(200).json({data});
      }

      // List ALL students across all schools
      if (action==="admin_list_all_students") {
        const {search, school_id, class_num, section} = req.body;
        let params = "?order=class_num,section,roll_no";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        if (class_num !== undefined) params += `&class_num=eq.${cleanInt(class_num,0,12)}`;
        if (section) params += `&section=eq.${clean(section,5).toUpperCase()}`;
        const r = await sbAll("students",params);
        let data = r.data||[];
        if (search) { const s=search.toLowerCase(); data=data.filter(t=>t.name?.toLowerCase().includes(s)||String(t.roll_no).includes(s)); }
        return res.status(200).json({data});
      }

      // List ALL classes (distinct class_num+section across all schools or one school)
      if (action==="admin_list_all_classes") {
        const {school_id, search} = req.body;
        let params = "?select=class_num,section,school_id&order=class_num,section";
        if (school_id && isUUID(school_id)) params += `&school_id=eq.${school_id}`;
        const r = await sbAll("students",params);
        const seen = new Set(); const rows = [];
        for (const s of (r.data||[])) {
          const key = `${s.school_id}__${s.class_num}__${s.section}`;
          if (!seen.has(key)) { seen.add(key); rows.push(s); }
        }
        return res.status(200).json({data:rows});
      }

      // List teachers for a school
      if (action==="admin_list_teachers") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const r = await sb("teachers","GET",null,`?school_id=eq.${school_id}&order=created_at`);
        return res.status(200).json({data:r.data});
      }

      if (action==="admin_list_students") {
      const {school_id, teacher_id} = req.body;
      if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
      let params = `?school_id=eq.${school_id}&order=class_num,section,roll_no`;
      if (teacher_id && isUUID(teacher_id)) params += `&teacher_id=eq.${teacher_id}`;
      const r = await sb("students","GET",null,params);
      return res.status(200).json({data:r.data});
    }
        if (action==="create_student_admin") {
      const {school_id, teacher_id, name, roll_no, pin, class_num, section} = req.body;
      if (!school_id||!name||!roll_no||!pin) return res.status(400).json({error:"Missing fields"});
      const pin_hash = hashPin(String(pin).slice(0,4));
      const r = await sb("students","POST",{
        school_id:clean(school_id,36), teacher_id:teacher_id||null,
        name:clean(name,50), roll_no:clean(String(roll_no),10),
        username:clean(req.body.username||roll_no||name,30).toLowerCase().replace(/\s+/g,'_'),
        class_num:cleanInt(class_num,0,7), section:clean(String(section||"A"),5).toUpperCase(),
        pin_hash, xp:0, coins:50, level:1, streak_days:0
      });
      if (!r.ok) return res.status(400).json({error:"Duplicate roll number"});
      return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
    }
      if (action==="admin_modify_teacher") {
      const {teacher_id, name, email, permissions} = req.body;
      if (!teacher_id) return res.status(400).json({error:"Missing teacher_id"});
      const update = {};
      if (name)  update.name  = clean(name,100);
      if (email) update.email = clean(email,100).toLowerCase();
      if (Array.isArray(permissions)) {
        const validPerms = ["change_student_pin","modify_student","delete_student","add_lesson_set_question","modify_lesson_set_question","delete_lesson_set_question","view_analytics"];
        update.permissions = permissions.filter(p=>validPerms.includes(p));
      }
      const r = await sb("teachers","PATCH",update,`?id=eq.${teacher_id}`);
      if (!r.ok) return res.status(400).json({error:"Update failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_delete_teacher") {
      const {teacher_id} = req.body;
      if (!teacher_id) return res.status(400).json({error:"Missing teacher_id"});
      await sb("students","PATCH",{teacher_id:null},`?teacher_id=eq.${teacher_id}`);
      const r = await sb("teachers","DELETE",null,`?id=eq.${teacher_id}`);
      if (!r.ok) return res.status(400).json({error:"Delete failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_modify_student") {
      const {student_id, name, roll_no, class_num, section, pin} = req.body;
      if (!student_id) return res.status(400).json({error:"Missing student_id"});
      const update = {};
      if (name)      update.name      = clean(name,50);
      if (roll_no)   update.roll_no   = clean(String(roll_no),10);
      if (class_num !== undefined) update.class_num = cleanInt(class_num,0,12);
      if (section)   update.section   = clean(String(section),5).toUpperCase();
      if (pin) { update.pin_hash = hashPin(String(pin).slice(0,6)); }
      const r = await sb("students","PATCH",update,`?id=eq.${student_id}`);
      if (!r.ok) return res.status(400).json({error:"Update failed"});
      return res.status(200).json({data:true});
    }
      if (action==="admin_delete_student") {
      const {student_id} = req.body;
      if (!student_id) return res.status(400).json({error:"Missing student_id"});
      await sb("student_progress","DELETE",null,`?student_id=eq.${student_id}`);
      const r = await sb("students","DELETE",null,`?id=eq.${student_id}`);
      if (!r.ok) return res.status(400).json({error:"Delete failed"});
      return res.status(200).json({data:true});
    }

      // Delete school
      if (action==="admin_delete_school") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        await sb("students","DELETE",null,`?school_id=eq.${school_id}`).catch(()=>{});
        await sb("teachers","DELETE",null,`?school_id=eq.${school_id}`).catch(()=>{});
        const r = await sb("schools","DELETE",null,`?id=eq.${school_id}`);
        return res.status(200).json({ok:r.ok});
      }

      // List classes (distinct class_num+section from students)
      if (action==="admin_list_classes") {
        const {school_id} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const r = await sb("students","GET",null,`?school_id=eq.${school_id}&select=class_num,section&order=class_num,section`);
        if (!r.ok) return res.status(400).json({error:"Failed"});
        const seen = new Set(); const rows = [];
        for (const s of (r.data||[])) {
          const key = `${s.class_num}__${s.section}`;
          if (!seen.has(key)) { seen.add(key); rows.push(s); }
        }
        return res.status(200).json({data:rows});
      }

      // Add a class (creates a teacher placeholder to represent the class)
      if (action==="admin_add_class") {
        const {school_id, class_num, section, teacher_name} = req.body;
        if (!isUUID(school_id)) return res.status(400).json({error:"Invalid school_id"});
        const cn = cleanInt(class_num,0,12);
        const sec = clean(String(section||"A"),5).toUpperCase();
        const labels = {10:"Nursery",11:"Jr KG",12:"Sr KG",1:"Class 1",2:"Class 2",3:"Class 3",4:"Class 4",5:"Class 5"};
        const label = labels[cn]||`Class ${cn}`;
        const name = clean(teacher_name||`${label}-${sec} Teacher`,100);
        const email = `class${cn}${sec.toLowerCase()}_${school_id.slice(0,6)}@mathmagic.internal`;
        const pin_hash = hashPin("1234");
        const r = await sb("teachers","POST",{school_id,name,email,pin_hash,class_label:`${label}-${sec}`});
        if (!r.ok) return res.status(400).json({error:"Class/teacher may already exist"});
        return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Bulk create teachers (CSV-style [{name,email,pin}])
      if (action==="admin_bulk_create_teachers") {
        const {school_id, rows} = req.body;
        if (!isUUID(school_id)||!Array.isArray(rows)) return res.status(400).json({error:"Missing fields"});
        const results = [];
        for (const row of rows.slice(0,50)) {
          const pin_hash = hashPin(String(row.pin||"1234").slice(0,6));
          const r = await sb("teachers","POST",{school_id,name:clean(row.name,100),email:clean(row.email,100).toLowerCase(),pin_hash});
          results.push({name:row.name,ok:r.ok,error:r.ok?null:"Failed (duplicate?)"});
        }
        return res.status(200).json({data:results});
      }

      // Bulk create students [{name,roll_no,class_num,section,pin}]
      if (action==="admin_bulk_create_students") {
        const {school_id, teacher_id, rows} = req.body;
        if (!isUUID(school_id)||!Array.isArray(rows)) return res.status(400).json({error:"Missing fields"});
        const results = [];
        for (const row of rows.slice(0,200)) {
          const pin_hash = hashPin(String(row.pin||"1234").slice(0,6));
          const username = `${clean(row.name||"",20).toLowerCase().replace(/\s+/g,"")}_${String(row.roll_no||"").padStart(3,"0")}`;
          const r = await sb("students","POST",{school_id,teacher_id:teacher_id||null,name:clean(row.name,50),roll_no:clean(String(row.roll_no),10),class_num:cleanInt(row.class_num,0,12),section:clean(String(row.section||"A"),5).toUpperCase(),username,pin_hash,xp:0,level:1,streak_days:0});
          results.push({name:row.name,ok:r.ok,error:r.ok?null:"Failed"});
        }
        return res.status(200).json({data:results});
      }

      // Questions: list lessons for a class
      if (action==="admin_list_lessons_for_class") {
        const {class_num} = req.body;
        const cn = cleanInt(class_num,0,12);
        const prefixMap = {10:"n",11:"jk",12:"sk",1:"c1",2:"c2",3:"c3",4:"c4",5:"c5"};
        const LESSON_TITLES = {
          10:["Counting 1–5","Counting 6–10","Shapes","Colors & Numbers","Big & Small","Patterns","More & Less","Number Writing","Sorting"],
          11:["Numbers 1–20","Addition Basics","Subtraction Basics","Shapes & Sizes","Patterns","Comparing Numbers","Missing Numbers","Simple Word Problems","Measurement Basics"],
          12:["Numbers 1–50","Addition to 20","Subtraction to 20","Multiplication Intro","Division Intro","Geometry Basics","Fractions Intro","Word Problems","Data Handling"],
          1:["Number Sense","Addition Basics","Subtraction Basics","Shapes & Space","Measurement","Patterns","Data Handling","Money Basics","Time Basics"],
          2:["Numbers to 100","Addition with Carry","Subtraction with Borrow","Multiplication Tables 2–5","Division Basics","Geometry","Fractions","Measurement","Data & Graphs"],
          3:["Numbers to 1000","Addition & Subtraction","Multiplication Tables","Division","Fractions","Decimals Intro","Geometry","Measurement","Time & Calendar"],
          4:["Large Numbers","Operations","Fractions & Decimals","Factors & Multiples","Geometry","Measurement","Data Handling","Patterns","Problem Solving"],
          5:["Number Systems","Fractions & Decimals","Algebra Basics","Geometry","Ratio & Proportion","Percentage","Data Handling","Mensuration","Problem Solving"],
        };
        const prefix = prefixMap[cn]||`c${cn}`;
        const titles = LESSON_TITLES[cn]||[];
        // Fetch with large range to get all rows
        const r = await sbAll("questions", `?lesson_id=gte.${prefix}-l&lesson_id=lte.${prefix}-m&select=lesson_id&order=lesson_id`);
        const seen = new Set(); const lessons = [];
        for (const q of (r.data||[])) {
          const raw = q.lesson_id||"";
          const lid = raw.includes("_s") ? raw.split("_s")[0] : raw;
          if (lid && !seen.has(lid)) { seen.add(lid); lessons.push(lid); }
        }
        // Also include expected lesson IDs from LESSONS constant that may exist in DB
        // Sort by lesson number
        const sorted = lessons.sort((a,b)=>{
          const na=parseInt(a.split("-l")[1]||0), nb=parseInt(b.split("-l")[1]||0);
          return na-nb;
        });
        // Attach title to each
        const withTitles = sorted.map(lid=>{
          const n=parseInt(lid.split("-l")[1]||1)-1;
          return {id:lid, title:titles[n]||`Lesson ${n+1}`};
        });
        return res.status(200).json({data:withTitles});
      }

      // Questions: list sets for a lesson
      if (action==="admin_list_sets_for_lesson") {
        const {lesson_id_prefix} = req.body;
        const safe = clean(lesson_id_prefix,30);
        const r = await sbAll("questions", `?lesson_id=gte.${safe}_s&lesson_id=lte.${safe}_t&select=lesson_id,set_index&order=set_index`);
        if (!r.ok) return res.status(400).json({error:"Failed"});
        const seen = new Set(); const sets = [];
        for (const q of (r.data||[])) { if (!seen.has(q.set_index)) { seen.add(q.set_index); sets.push(q.set_index); } }
        return res.status(200).json({data:sets.sort((a,b)=>a-b)});
      }

      // Questions: list questions in a set
      if (action==="admin_list_questions") {
        const {lesson_id_prefix, set_index} = req.body;
        const safe = clean(lesson_id_prefix,30);
        const si = cleanInt(set_index,0,99);
        const r = await sbAll("questions", `?lesson_id=gte.${safe}_s&lesson_id=lte.${safe}_t&set_index=eq.${si}&order=question_index`);
        return res.status(200).json({data:r.data||[]});
      }

      // Questions: add single question
      if (action==="admin_add_question") {
        const {lesson_id,set_index,question_index,question,options,correct_answer,hint} = req.body;
        if (!lesson_id||!question||!Array.isArray(options)||options.length!==4) return res.status(400).json({error:"Need lesson_id, question, 4 options"});
        const r = await sb("questions","POST",{lesson_id:clean(lesson_id,50),set_index:cleanInt(set_index,0,99),question_index:cleanInt(question_index||0,0,99),question:clean(question,500),options:options.map(o=>clean(String(o),200)),correct_answer:cleanInt(correct_answer,0,3),hint:clean(hint||"",200)});
        if (!r.ok) return res.status(400).json({error:"Failed — duplicate index?"});
        return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
      }

      // Questions: update question
      if (action==="admin_update_question") {
        const {id,question,options,correct_answer,hint} = req.body;
        if (!isUUID(id)) return res.status(400).json({error:"Invalid id"});
        const update = {};
        if (question) update.question = clean(question,500);
        if (options&&Array.isArray(options)&&options.length===4) update.options = options.map(o=>clean(String(o),200));
        if (correct_answer!==undefined) update.correct_answer = cleanInt(correct_answer,0,3);
        if (hint!==undefined) update.hint = clean(hint,200);
        const r = await sb("questions","PATCH",update,`?id=eq.${id}`);
        return res.status(200).json({ok:r.ok});
      }

      // Questions: delete question
      if (action==="admin_delete_question") {
        const {id} = req.body;
        if (!isUUID(id)) return res.status(400).json({error:"Invalid id"});
        const r = await sb("questions","DELETE",null,`?id=eq.${id}`);
        return res.status(200).json({ok:r.ok});
      }

      // Questions: create new lesson (returns next lesson_id)
      if (action==="admin_add_lesson") {
        const {class_num} = req.body;
        const cn = cleanInt(class_num,0,12);
        const prefixMap = {10:"n",11:"jk",12:"sk",1:"c1",2:"c2",3:"c3",4:"c4",5:"c5"};
        const prefix = prefixMap[cn]||`c${cn}`;
        const r = await sb("questions","GET",null,`?lesson_id=like.${prefix}-%25&select=lesson_id&order=lesson_id`);
        const existing = new Set((r.data||[]).map(q=>q.lesson_id.includes("_s")?q.lesson_id.split("_s")[0]:q.lesson_id));
        let n = 1; while (existing.has(`${prefix}-l${n}`)) n++;
        const new_lesson_id = `${prefix}-l${n}`;
        return res.status(200).json({data:{lesson_id:new_lesson_id,class_num:cn}});
      }

      // Questions: bulk add questions to a set
      if (action==="admin_bulk_add_questions") {
        const {lesson_id,set_index,questions} = req.body;
        if (!lesson_id||!Array.isArray(questions)) return res.status(400).json({error:"Missing fields"});
        const si = cleanInt(set_index,0,99);
        const existing = await sb("questions","GET",null,`?lesson_id=eq.${clean(lesson_id,50)}&set_index=eq.${si}&select=question_index&order=question_index.desc&limit=1`);
        let nextIdx = existing.data&&existing.data.length>0 ? existing.data[0].question_index+1 : 0;
        const results = [];
        for (const [i,q] of questions.slice(0,100).entries()) {
          if (!q.question||!Array.isArray(q.options)||q.options.length!==4) { results.push({ok:false,error:"Bad row "+i}); continue; }
          const r = await sb("questions","POST",{lesson_id:clean(lesson_id,50),set_index:si,question_index:nextIdx+i,question:clean(q.question,500),options:q.options.map(o=>clean(String(o),200)),correct_answer:cleanInt(q.correct_answer,0,3),hint:clean(q.hint||"",200)});
          results.push({ok:r.ok,error:r.ok?null:"Failed"});
        }
        return res.status(200).json({data:results});
      }

      // ── Non-school (home) students via children table ─────────────
      if (action==="admin_debug_children") {
        // Returns raw count + first 3 rows for debugging
        const r1 = await sb("children","GET",null,"?select=id,name,class_num,xp&limit=5&order=id.desc");
        const r2 = await sb("children","GET",null,"?select=id&limit=1&order=id.asc");
        return res.status(200).json({sample:r1.data, r1_ok:r1.ok, r2_ok:r2.ok, has_rows:Array.isArray(r1.data)&&r1.data.length>0});
      }

      if (action==="admin_check_username") {
        // Real-time uniqueness check for home student username
        const {username, exclude_id} = req.body;
        if (!username) return res.status(200).json({available:false, error:"Enter a username"});
        const u = clean(username,30).toLowerCase().replace(/[^a-z0-9_.]/g,"");
        if (u.length < 3) return res.status(200).json({available:false, error:"Min 3 characters"});
        let qs = `?username=eq.${encodeURIComponent(u)}&parent_id=is.null&select=id`;
        if (exclude_id) qs += `&id=neq.${encodeURIComponent(exclude_id)}`;
        const r = await sb("children","GET",null,qs);
        const taken = Array.isArray(r.data) && r.data.length > 0;
        return res.status(200).json({available:!taken, username:u});
      }

      if (action==="admin_list_home_students") {
        const {search, class_num} = req.body;
        // Use same pattern as db.js get_children — proven to work
        let qs = "?select=*&order=created_at.desc";
        if (class_num!==undefined) qs += `&class_num=eq.${cleanInt(class_num,0,12)}`;
        if (search) qs += `&name=ilike.*${encodeURIComponent(clean(search,50))}*`;
        // Direct fetch matching db.js pattern exactly
        const resp = await fetch(`${SB_URL}/rest/v1/children${qs}&limit=10000&offset=0`, {
          method:"GET",
          headers:{
            apikey:SB_SERVICE,
            Authorization:`Bearer ${SB_SERVICE}`,
            "Content-Type":"application/json",
            Prefer:"return=minimal",
          }
        });
        const txt = await resp.text();
        let data; try { data=JSON.parse(txt); } catch { data=[]; }
        if (!resp.ok) return res.status(200).json({data:[], _debug:`HTTP ${resp.status}: ${txt.slice(0,200)}`});
        return res.status(200).json({data: Array.isArray(data)?data:[], _count:Array.isArray(data)?data.length:0});
      }

      if (action==="admin_create_home_student") {
        const {name, class_num, pin, avatar, username} = req.body;
        if (!name||!pin) return res.status(400).json({error:"Name and PIN required"});
        if (!username) return res.status(400).json({error:"Username required"});
        const uname = clean(username,30).toLowerCase().replace(/[^a-z0-9_.]/g,"");
        if (uname.length < 3) return res.status(400).json({error:"Username must be at least 3 characters"});
        // Enforce uniqueness
        const chk = await sb("children","GET",null,`?username=eq.${encodeURIComponent(uname)}&parent_id=is.null&select=id`);
        if (Array.isArray(chk.data) && chk.data.length > 0) return res.status(400).json({error:"Username already taken. Choose another."});
        const pin_hash = hashPin(String(pin).slice(0,6));
        const r = await sb("children","POST",{
          name:clean(name,50), username:uname, class_num:cleanInt(class_num,1,12),
          pin_hash, avatar:clean(avatar||"🚀",10),
          xp:0, level:1, coins:50, streak_days:0, is_premium:false,
          created_at:new Date().toISOString()
        });
        if (!r.ok) return res.status(400).json({error:"Failed to create"});
        return res.status(200).json({data:Array.isArray(r.data)?r.data[0]:r.data});
      }

      if (action==="admin_modify_home_student") {
        const {child_id, name, class_num, avatar, pin, username} = req.body;
        if (!child_id) return res.status(400).json({error:"Missing child_id"});
        const update = {};
        if (name)       update.name      = clean(name,50);
        if (class_num!==undefined) update.class_num = cleanInt(class_num,0,12);
        if (avatar)     update.avatar    = clean(avatar,10);
        if (pin)        update.pin_hash  = hashPin(String(pin).slice(0,6));
        if (username) {
          const uname = clean(username,30).toLowerCase().replace(/[^a-z0-9_.]/g,"");
          if (uname.length < 3) return res.status(400).json({error:"Username too short"});
          const chk = await sb("children","GET",null,`?username=eq.${encodeURIComponent(uname)}&parent_id=is.null&id=neq.${encodeURIComponent(child_id)}&select=id`);
          if (Array.isArray(chk.data) && chk.data.length > 0) return res.status(400).json({error:"Username already taken."});
          update.username = uname;
        }
        const r = await sb("children","PATCH",update,`?id=eq.${encodeURIComponent(child_id)}`);
        if (!r.ok) return res.status(400).json({error:"Update failed"});
        return res.status(200).json({data:r.data});
      }

      if (action==="admin_delete_home_student") {
        const {child_id} = req.body;
        if (!child_id) return res.status(400).json({error:"Missing child_id"});
        await sb("progress","DELETE",null,`?child_id=eq.${encodeURIComponent(child_id)}`);
        const r = await sb("children","DELETE",null,`?id=eq.${encodeURIComponent(child_id)}`);
        return res.status(200).json({ok:true});
      }

      if (action==="admin_home_student_login") {
        // Login by username + PIN — unique username eliminates name collision
        const {username, pin} = req.body;
        if (!username||!pin) return res.status(400).json({error:"Username and PIN required"});
        const uname = clean(username,30).toLowerCase().replace(/[^a-z0-9_.]/g,"");
        const pin_hash = hashPin(String(pin).slice(0,6));
        const r = await sb("children","GET",null,`?username=eq.${encodeURIComponent(uname)}&parent_id=is.null&select=*`);
        if (!Array.isArray(r.data)||r.data.length===0) return res.status(200).json({error:"Username not found"});
        const child = r.data[0];
        if (child.pin_hash !== pin_hash) return res.status(200).json({error:"Wrong PIN"});
        // Update streak
        const today = new Date().toISOString().slice(0,10);
        const lastActive = child.last_active ? new Date(child.last_active).toISOString().slice(0,10) : null;
        const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
        const newStreak = lastActive===today ? (child.streak_days||0) : lastActive===yesterday ? (child.streak_days||0)+1 : 1;
        await sb("children","PATCH",{streak_days:newStreak, last_active:new Date().toISOString()},`?id=eq.${encodeURIComponent(child.id)}`).catch(()=>{});
        return res.status(200).json({ child: {...child, streak_days:newStreak} });
      }


      // ── Analytics endpoints ────────────────────────────────────────
      if (action==="admin_get_analytics") {
        const {days=30} = req.body;
        const since = new Date(Date.now() - days*86400000).toISOString();
        const [evts, ratings, feedback] = await Promise.all([
          sbAll("analytics", `?created_at=gte.${since}&order=created_at.desc&select=event_type,created_at,child_id`),
          sbAll("app_ratings", `?created_at=gte.${since}&order=created_at.desc&select=rating,review,created_at`),
          sbAll("feedback", `?order=created_at.desc&select=id,child_name,category,description,screen,status,created_at`),
        ]);
        // Aggregate event counts
        const eventCounts = {};
        for (const e of evts.data||[]) eventCounts[e.event_type] = (eventCounts[e.event_type]||0)+1;
        // Daily active users (unique child_ids per day)
        const dauMap = {};
        for (const e of evts.data||[]) {
          const day = e.created_at?.slice(0,10);
          if (!day||!e.child_id) continue;
          if (!dauMap[day]) dauMap[day] = new Set();
          dauMap[day].add(e.child_id);
        }
        const dau = Object.entries(dauMap).map(([date,s])=>({date,count:s.size})).sort((a,b)=>a.date.localeCompare(b.date));
        // Ratings summary
        const rs = ratings.data||[];
        const avgRating = rs.length ? (rs.reduce((s,r)=>s+r.rating,0)/rs.length).toFixed(1) : null;
        const ratingDist = {1:0,2:0,3:0,4:0,5:0};
        for (const r of rs) ratingDist[r.rating]=(ratingDist[r.rating]||0)+1;
        return res.status(200).json({
          eventCounts, dau,
          totalEvents: (evts.data||[]).length,
          avgRating, ratingDist, totalRatings: rs.length,
          recentRatings: rs.slice(0,10),
          feedback: feedback.data||[],
        });
      }

      if (action==="admin_update_feedback_status") {
        const {id, status} = req.body;
        if (!id||!status) return res.status(400).json({error:"Missing fields"});
        const r = await sb("feedback","PATCH",{status:clean(status,20)},`?id=eq.${encodeURIComponent(id)}`);
        return res.status(200).json({ok:r.ok});
      }

      return res.status(400).json({error:"Unknown admin action"});

  } catch(err) {
    console.error("[admin API]", err.message);
    return res.status(500).json({error:"Server error"});
  }
}