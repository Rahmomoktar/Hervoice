import assert from 'node:assert/strict';
export async function specialistTests({api,at,vt,ct,rt,report,password,consultantId,adminId}){
 const staff={name:'Fictional Specialist',email:'counselor@example.test',role:'consultant',password,consultantTitle:'Counselor',organization:'Fictional Support Team',specialties:['Bullying','Harassment']};
 await api('/admin/staff','POST',{...staff,consultantTitle:'Administrator'},at,400);
 await api('/admin/staff','POST',{...staff,specialties:[]},at,400);
 await api('/admin/staff','POST',{...staff,specialties:['Unknown category']},at,400);
 await api('/admin/staff','POST',{...staff,organization:'x'.repeat(101)},at,400);
 await api('/admin/staff','POST',staff,rt,403);
 const counselor=(await api('/admin/staff','POST',staff,at,201)).user;
 assert.equal(counselor.role,'consultant');assert.equal(counselor.consultantTitle,'Counselor');assert.equal(counselor.organization,staff.organization);
 const police=(await api('/admin/staff','POST',{...staff,name:'Fictional Police Liaison',email:'police@example.test',consultantTitle:'Police liaison',specialties:['Harassment']},at,201)).user;
 const login=async email=>api('/auth/login','POST',{email,password});
 const counseling=await login(staff.email),policing=await login('police@example.test');
 assert.equal(counseling.user.consultantTitle,'Counselor');assert.deepEqual(counseling.user.specialties,staff.specialties);
 assert.equal(policing.user.role,'consultant');
 const directory=(await api('/staff/consultants','GET',undefined,vt)).consultants;
 const profile=directory.find(c=>c.id===counselor.id);assert.equal(profile.consultantTitle,'Counselor');
 assert.ok(!JSON.stringify(directory).includes('email'));assert.ok(!JSON.stringify(directory).includes('password'));
 await api('/staff/consultants','GET',undefined,rt,403);
 const path='/reports/'+report.id;
 await api(path,'PATCH',{consultant:police.id},vt,400);
 await api(path,'GET',undefined,policing.token,403);
 await api(path,'PATCH',{consultant:counselor.id},rt,403);
 await api(path,'PATCH',{consultant:counselor.id},vt);
 assert.equal((await api('/reports/accepted','GET',undefined,counseling.token)).reports.length,1);
 await api(path,'GET',undefined,ct,403);
 const detail=(await api(path,'GET',undefined,rt)).report;
 assert.equal(detail.consultantProfile.consultantTitle,'Counselor');assert.equal(detail.consultantProfile.organization,staff.organization);
 assert.ok(!JSON.stringify(detail.consultantProfile).includes('email'));assert.ok(!JSON.stringify(detail.consultantProfile).includes('password'));
 await api(path+'/messages','GET',undefined,counseling.token);
 await api(path+'/messages','GET',undefined,policing.token,403);
 const fields={consultantTitle:'Organization representative',organization:'Fictional Advocacy Team',specialties:['Discrimination']};
 const edit='/admin/users/'+counselor.id+'/specialist';
 for(const token of [rt,vt,counseling.token])await api(edit,'PATCH',fields,token,403);
 await api(edit,'PATCH',{...fields,role:'admin'},at,400);
 await api(edit,'PATCH',{...fields,specialties:[]},at,400);
 await api(edit,'PATCH',{consultantTitle:'Police liaison'},at,400);
 await api('/admin/users/'+adminId+'/specialist','PATCH',fields,at,404);
 await api(edit,'PATCH',fields,at);
 assert.equal((await api('/auth/me','GET',undefined,counseling.token)).user.consultantTitle,'Organization representative');
 await api(path,'GET',undefined,counseling.token); // Existing support remains available after a profile update.
 await api(path,'PATCH',{consultant:counselor.id},vt,400); // New assignments still validate the current specialty.
 await api(edit,'PATCH',{consultantTitle:'Counselor',organization:staff.organization,specialties:staff.specialties},at);
 await api(path,'PATCH',{consultant:consultantId},vt);
 await api(path,'GET',undefined,counseling.token,403);
 // Specialty settings are preserved through the existing invitation workflow.
 const invite=await api('/admin/staff','POST',{name:'Fictional Legal Advisor',email:'legal@example.test',role:'consultant',consultantTitle:'Legal advisor',organization:'Fictional Legal Team',specialties:['Unfair Treatment']},at,201);
 assert.ok(!(await api('/staff/consultants','GET',undefined,vt)).consultants.some(c=>c.id===invite.user.id));
 const invitation=new URL(invite.invitationUrl).hash.slice(8);
 await api('/auth/accept-invitation','POST',{invitation,password},undefined);
 const legal=await login('legal@example.test');assert.equal(legal.user.consultantTitle,'Legal advisor');assert.deepEqual(legal.user.specialties,['Unfair Treatment']);
 await api(path,'GET',undefined,legal.token,403);
 const self=await api('/auth/register','POST',{name:'Fictional Reporter Specialty Attempt',email:'role-attempt@example.test',password,role:'consultant',consultantTitle:'Police liaison',specialties:['Bullying']},undefined,201);
 assert.equal(self.user.role,'reporter');assert.ok(!('consultantTitle' in self.user));
 console.log('PASS consultant titles, specialties, invitation persistence, admin-only profile editing, category assignment validation, assigned-only access and reporter team display');
}
