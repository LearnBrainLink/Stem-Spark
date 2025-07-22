exports.id=6754,exports.ids=[1725,6754],exports.modules={19901:(e,r,t)=>{"use strict";t.d(r,{Ay:()=>a,uO:()=>o});var s=t(78286);async function o(e){try{let e=(0,s.createClient)(),{data:{user:r},error:t}=await e.auth.getUser();if(t||!r)return{error:"Unauthorized",status:401};let{data:o,error:i}=await e.from("profiles").select("role, is_super_admin").eq("id",r.id).single();if(i||!o)return{error:"Profile not found",status:404};if("admin"!==o.role&&!o.is_super_admin)return{error:"Admin access required",status:403};return{user:r,profile:o,error:null}}catch(e){return{error:"Internal server error",status:500}}}t(85454);class i{async getAdminActionLogs(e=100){try{let{data:r,error:t}=await this.supabase.from("admin_actions_log").select(`
          *,
          performed_by:profiles!admin_actions_log_performed_by_fkey(full_name, email),
          target_user:profiles!admin_actions_log_target_user_id_fkey(full_name, email)
        `).order("created_at",{ascending:!1}).limit(e);if(t)throw t;return r||[]}catch(e){throw console.error("Error fetching admin action logs:",e),e}}async logAdminAction(e,r,t,s,o=!0,i){try{let{error:a}=await this.supabase.from("admin_actions_log").insert({action_type:e,performed_by:r,target_user_id:t,metadata:s,is_allowed:o,reason:i});if(a)throw a}catch(e){throw console.error("Error logging admin action:",e),e}}async validateAdminAccess(e){try{let{data:r,error:t}=await this.supabase.from("profiles").select("role, is_super_admin").eq("id",e).single();if(t||!r)return{isValid:!1,reason:"Profile not found"};if("admin"!==r.role&&!r.is_super_admin)return{isValid:!1,reason:"Admin access required"};return{isValid:!0,profile:r}}catch(e){return console.error("Error validating admin access:",e),{isValid:!1,reason:"Error validating access"}}}async canEditUser(e,r){try{let{data:t,error:s}=await this.supabase.from("profiles").select("role, is_super_admin").eq("id",e).single();if(s||!t)return{canEdit:!1,reason:"Current user not found"};if("admin"!==t.role&&!t.is_super_admin)return{canEdit:!1,reason:"Insufficient permissions"};if(e===r)return{canEdit:!0};let{data:o,error:i}=await this.supabase.from("profiles").select("role, is_super_admin").eq("id",r).single();if(i||!o)return{canEdit:!1,reason:"Target user not found"};if(t.is_super_admin)return{canEdit:!0};if("admin"===o.role||o.is_super_admin)return{canEdit:!1,reason:"Cannot edit other administrators"};return{canEdit:!0}}catch(e){return console.error("Error checking admin edit permissions:",e),{canEdit:!1,reason:"Error checking permissions"}}}constructor(){this.supabase=(0,s.createClient)()}}let a=i},23079:(e,r,t)=>{"use strict";t.d(r,{A:()=>l});var s=t(73205),o=t(19901),i=t(78286);let a=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";class n{constructor(){this.supabase=(0,i.createClient)()}async sendEmail(e){try{let r=await fetch(`${a}/api/send-email`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),t=await r.json();if(!t.success)throw Error(t.error||"Failed to send email");return{success:!0,message_id:t.message_id,service:t.service}}catch(e){throw console.error("Email service error:",e),e}}async sendWelcomeEmail(e,r,t){let s={user_name:r,verification_link:t,login_url:`${a}/login`,support_email:"support@stemsparkacademy.com"};return this.sendEmail({to_email:e,subject:"Welcome to STEM Spark Academy!",template:"welcome_email",template_data:s,fallback_html:`
        <h1>Welcome to STEM Spark Academy!</h1>
        <p>Hello ${r},</p>
        <p>Welcome to STEM Spark Academy! We're excited to have you join our community.</p>
        ${t?`<p><a href="${t}">Click here to verify your email</a></p>`:""}
        <p>You can now <a href="${a}/login">log in to your account</a> and start exploring.</p>
        <p>If you have any questions, please contact us at support@stemsparkacademy.com</p>
        <p>Best regards,<br>The STEM Spark Academy Team</p>
      `})}async sendPasswordResetEmail(e,r){return this.sendEmail({to_email:e,subject:"Reset Your Password - STEM Spark Academy",template:"password_reset",template_data:{reset_link:r,expiry_hours:24,support_email:"support@stemsparkacademy.com"},fallback_html:`
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your STEM Spark Academy account.</p>
        <p><a href="${r}">Click here to reset your password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>For support, contact us at support@stemsparkacademy.com</p>
      `})}async sendVolunteerHoursApprovedEmail(e,r,t){let s={user_name:r,hours:t.hours,activity_type:t.activity_type,activity_date:t.activity_date,total_hours:t.total_hours,dashboard_url:`${a}/intern-dashboard/volunteer-hours`};return this.sendEmail({to_email:e,subject:"Volunteer Hours Approved - STEM Spark Academy",template:"volunteer_hours_approved",template_data:s,fallback_html:`
        <h1>Volunteer Hours Approved!</h1>
        <p>Hello ${r},</p>
        <p>Great news! Your volunteer hours have been approved.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Activity: ${t.activity_type}</li>
          <li>Date: ${t.activity_date}</li>
          <li>Hours: ${t.hours}</li>
          <li>Total Hours: ${t.total_hours}</li>
        </ul>
        <p><a href="${a}/intern-dashboard/volunteer-hours">View your volunteer hours dashboard</a></p>
        <p>Thank you for your contribution to STEM Spark Academy!</p>
      `})}async sendVolunteerHoursRejectedEmail(e,r,t,s){let o={user_name:r,hours:t.hours,activity_type:t.activity_type,activity_date:t.activity_date,rejection_reason:s,dashboard_url:`${a}/intern-dashboard/volunteer-hours`};return this.sendEmail({to_email:e,subject:"Volunteer Hours Update - STEM Spark Academy",template:"volunteer_hours_rejected",template_data:o,fallback_html:`
        <h1>Volunteer Hours Update</h1>
        <p>Hello ${r},</p>
        <p>Your volunteer hours submission requires attention.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Activity: ${t.activity_type}</li>
          <li>Date: ${t.activity_date}</li>
          <li>Hours: ${t.hours}</li>
        </ul>
        <p><strong>Reason for rejection:</strong> ${s}</p>
        <p><a href="${a}/intern-dashboard/volunteer-hours">Update your submission</a></p>
        <p>Please review and resubmit with the requested changes.</p>
      `})}async sendNewVolunteerHoursNotification(e,r){let t={intern_name:r.intern_name,activity_type:r.activity_type,activity_date:r.activity_date,hours:r.hours,description:r.description,admin_dashboard_url:`${a}/admin/volunteer-hours`};return Promise.all(e.map(e=>this.sendEmail({to_email:e,subject:"New Volunteer Hours Submission - STEM Spark Academy",template:"new_volunteer_hours_notification",template_data:t,fallback_html:`
          <h1>New Volunteer Hours Submission</h1>
          <p>A new volunteer hours submission requires your review.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Intern: ${r.intern_name}</li>
            <li>Activity: ${r.activity_type}</li>
            <li>Date: ${r.activity_date}</li>
            <li>Hours: ${r.hours}</li>
            <li>Description: ${r.description}</li>
          </ul>
          <p><a href="${a}/admin/volunteer-hours">Review submission</a></p>
        `})))}async sendTutoringSessionConfirmation(e,r,t){let s={user_name:r,subject:t.subject,topic:t.topic,tutor_name:t.tutor_name,scheduled_date:t.scheduled_date,scheduled_time:t.scheduled_time,duration:t.duration,meeting_link:t.meeting_link,dashboard_url:`${a}/tutoring`};return this.sendEmail({to_email:e,subject:"Tutoring Session Confirmed - STEM Spark Academy",template:"tutoring_session_confirmation",template_data:s,fallback_html:`
        <h1>Tutoring Session Confirmed</h1>
        <p>Hello ${r},</p>
        <p>Your tutoring session has been confirmed!</p>
        <p><strong>Session Details:</strong></p>
        <ul>
          <li>Subject: ${t.subject}</li>
          <li>Topic: ${t.topic}</li>
          <li>Tutor: ${t.tutor_name}</li>
          <li>Date: ${t.scheduled_date}</li>
          <li>Time: ${t.scheduled_time}</li>
          <li>Duration: ${t.duration} minutes</li>
        </ul>
        ${t.meeting_link?`<p><a href="${t.meeting_link}">Join session</a></p>`:""}
        <p><a href="${a}/tutoring">View your tutoring dashboard</a></p>
      `})}async checkEmailServiceHealth(){try{let e=await fetch(`${a}/api/send-email`,{method:"GET"}),r=await e.json();return{healthy:e.ok&&"healthy"===r.status,service:r.service,details:r.details}}catch(e){return{healthy:!1,service:"unknown",error:e.message}}}}class u{constructor(){this.supabase=(0,s.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),this.adminProtection=new o.Ay}async submitVolunteerHours(e){try{if(!e.intern_id||!e.activity_date||!e.hours)return{success:!1,error:"Missing required fields"};if(e.hours<=0||e.hours>24)return{success:!1,error:"Hours must be between 0 and 24"};let{data:r,error:t}=await this.supabase.from("profiles").select("*").eq("id",e.intern_id).eq("role","intern").single();if(t||!r)return{success:!1,error:"Invalid intern account"};let{data:s,error:o}=await this.supabase.from("volunteer_hours").insert({intern_id:e.intern_id,activity_date:e.activity_date,activity_type:e.activity_type,activity_description:e.activity_description,hours:e.hours,description:e.description,reference_id:e.reference_id,status:"pending"}).select().single();if(o)return console.error("Error submitting volunteer hours:",o),{success:!1,error:"Failed to submit volunteer hours"};return await this.notifyAdminsOfNewSubmission(s,r),{success:!0,data:s}}catch(e){return console.error("Error in submitVolunteerHours:",e),{success:!1,error:"Internal server error"}}}async approveVolunteerHours(e,r,t){try{let s=await this.adminProtection.canPerformAction({action_type:"approve_hours",target_user_id:r,performed_by:r,is_allowed:!1,metadata:t});if(!s.allowed)return{success:!1,error:s.reason};let{data:o,error:i}=await this.supabase.from("volunteer_hours").select("*, intern:profiles!volunteer_hours_intern_id_fkey(*)").eq("id",e).single();if(i||!o)return{success:!1,error:"Volunteer hours not found"};if("pending"!==o.status)return{success:!1,error:"Hours are not pending approval"};let{data:a,error:u}=await this.supabase.from("volunteer_hours").update({status:"approved",approved_by:r,approved_at:new Date().toISOString()}).eq("id",e).select().single();if(u)return console.error("Error approving volunteer hours:",u),{success:!1,error:"Failed to approve volunteer hours"};return await this.updateInternTotalHours(o.intern_id),await n.sendVolunteerHoursApproval(o.intern,a),{success:!0,data:a}}catch(e){return console.error("Error in approveVolunteerHours:",e),{success:!1,error:"Internal server error"}}}async rejectVolunteerHours(e,r,t,s){try{let o=await this.adminProtection.canPerformAction({action_type:"reject_hours",target_user_id:r,performed_by:r,is_allowed:!1,metadata:s});if(!o.allowed)return{success:!1,error:o.reason};if(!t.trim())return{success:!1,error:"Rejection reason is required"};let{data:i,error:a}=await this.supabase.from("volunteer_hours").select("*, intern:profiles!volunteer_hours_intern_id_fkey(*)").eq("id",e).single();if(a||!i)return{success:!1,error:"Volunteer hours not found"};if("pending"!==i.status)return{success:!1,error:"Hours are not pending approval"};let{data:u,error:l}=await this.supabase.from("volunteer_hours").update({status:"rejected",rejection_reason:t}).eq("id",e).select().single();if(l)return console.error("Error rejecting volunteer hours:",l),{success:!1,error:"Failed to reject volunteer hours"};return await n.sendVolunteerHoursRejection(i.intern,u,t),{success:!0,data:u}}catch(e){return console.error("Error in rejectVolunteerHours:",e),{success:!1,error:"Internal server error"}}}async getInternVolunteerHours(e){try{let{data:r,error:t}=await this.supabase.from("volunteer_hours").select("*").eq("intern_id",e).order("created_at",{ascending:!1});if(t)return console.error("Error fetching intern volunteer hours:",t),{success:!1,error:"Failed to fetch volunteer hours"};return{success:!0,data:r||[]}}catch(e){return console.error("Error in getInternVolunteerHours:",e),{success:!1,error:"Internal server error"}}}async getPendingVolunteerHours(){try{let{data:e,error:r}=await this.supabase.from("volunteer_hours").select(`
          *,
          intern:profiles!volunteer_hours_intern_id_fkey(*)
        `).eq("status","pending").order("created_at",{ascending:!1});if(r)return console.error("Error fetching pending volunteer hours:",r),{success:!1,error:"Failed to fetch pending hours"};return{success:!0,data:e||[]}}catch(e){return console.error("Error in getPendingVolunteerHours:",e),{success:!1,error:"Internal server error"}}}async getInternVolunteerStats(e){try{let{data:r,error:t}=await this.supabase.from("volunteer_hours").select("*").eq("intern_id",e);if(t)return console.error("Error fetching volunteer hours for stats:",t),{success:!1,error:"Failed to fetch volunteer hours"};let s=r?.reduce((e,r)=>e+r.hours,0)||0,o=r?.filter(e=>"approved"===e.status).reduce((e,r)=>e+r.hours,0)||0,i=r?.filter(e=>"pending"===e.status).reduce((e,r)=>e+r.hours,0)||0,a=r?.filter(e=>"rejected"===e.status).reduce((e,r)=>e+r.hours,0)||0,n=new Date;n.setDate(n.getDate()-30);let u=r?.filter(e=>new Date(e.created_at||"")>n).length||0,l=Math.max(1,Math.ceil((Date.now()-new Date(r?.[0]?.created_at||Date.now()).getTime())/2592e6));return{success:!0,data:{total_hours:s,approved_hours:o,pending_hours:i,rejected_hours:a,recent_submissions:u,average_hours_per_month:Math.round(s/l*100)/100}}}catch(e){return console.error("Error in getInternVolunteerStats:",e),{success:!1,error:"Internal server error"}}}async createHoursFromTutoringSession(e,r,t,s){try{let{data:o,error:i}=await this.supabase.from("tutoring_sessions").select("*").eq("id",e).eq("intern_id",r).eq("status","completed").single();if(i||!o)return{success:!1,error:"Tutoring session not found or not completed"};let{data:a}=await this.supabase.from("volunteer_hours").select("*").eq("reference_id",e).single();if(a)return{success:!1,error:"Volunteer hours already exist for this session"};let{data:n,error:u}=await this.supabase.from("volunteer_hours").insert({intern_id:r,activity_date:o.scheduled_time||new Date().toISOString().split("T")[0],activity_type:"Tutoring Session",activity_description:`Tutoring session for ${o.subject}`,hours:t,description:s||`Completed tutoring session in ${o.subject}`,reference_id:e,status:"approved",approved_at:new Date().toISOString()}).select().single();if(u)return console.error("Error creating hours from tutoring session:",u),{success:!1,error:"Failed to create volunteer hours"};return await this.updateInternTotalHours(r),{success:!0,data:n}}catch(e){return console.error("Error in createHoursFromTutoringSession:",e),{success:!1,error:"Internal server error"}}}async updateInternTotalHours(e){try{let{data:r}=await this.supabase.from("volunteer_hours").select("hours").eq("intern_id",e).eq("status","approved"),t=r?.reduce((e,r)=>e+r.hours,0)||0;await this.supabase.from("profiles").update({total_volunteer_hours:t}).eq("id",e)}catch(e){console.error("Error updating intern total hours:",e)}}async notifyAdminsOfNewSubmission(e,r){try{let{data:t}=await this.supabase.from("profiles").select("email, full_name").eq("role","admin");if(t&&t.length>0)for(let s of t)await n.sendEmail({to:s.email,subject:`New Volunteer Hours Submission - ${r.full_name}`,body:`
              <h3>New Volunteer Hours Submission</h3>
              <p><strong>Intern:</strong> ${r.full_name}</p>
              <p><strong>Activity:</strong> ${e.activity_type}</p>
              <p><strong>Hours:</strong> ${e.hours}</p>
              <p><strong>Date:</strong> ${e.activity_date}</p>
              <p><strong>Description:</strong> ${e.activity_description}</p>
              <br>
              <p>Please review and approve/reject this submission.</p>
            `})}catch(e){console.error("Error notifying admins:",e)}}}let l=u},28187:()=>{},50253:()=>{},56836:()=>{},60931:e=>{function r(e){var r=Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}r.keys=()=>[],r.resolve=r,r.id=60931,e.exports=r},78286:(e,r,t)=>{"use strict";t.d(r,{createClient:()=>i});var s=t(72831),o=t(62519);function i(){let e=(0,o.UL)();return(0,s.Ri)(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll:()=>e.getAll(),setAll(r){try{r.forEach(({name:r,value:t,options:s})=>e.set(r,t,s))}catch{}}}})}},81331:()=>{}};