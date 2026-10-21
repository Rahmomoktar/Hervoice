export const consultantTitles=['General consultant','Support worker','Counselor','Organization representative','Police liaison','Legal advisor','Health specialist','Shelter coordinator','Other specialist'];
export const specialistCategories=['Bullying','Harassment','Discrimination','Unfair Treatment','Other'];
export function specialistFields(body){
 const consultantTitle=body.consultantTitle??'General consultant';
 const specialties=body.specialties??specialistCategories;
 const organization=body.organization??'';
 if(!consultantTitles.includes(consultantTitle)||!Array.isArray(specialties)||!specialties.length||!specialties.every(s=>specialistCategories.includes(s))||typeof organization!=='string'||organization.length>100)return null;
 return {consultantTitle,specialties:[...new Set(specialties)],organization:organization.trim()};
}
export const consultantProfile=u=>({id:u.id,name:u.name,consultantTitle:u.consultantTitle||'General consultant',organization:u.organization||'',specialties:u.specialties?.length?u.specialties:specialistCategories});
