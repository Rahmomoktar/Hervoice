import React,{useEffect,useRef} from 'react';
export default function ConfirmLogout({open,onCancel,onConfirm}){
 const dialog=useRef(null);
 useEffect(()=>{if(open&&!dialog.current.open)dialog.current.showModal();else if(!open&&dialog.current.open)dialog.current.close();},[open]);
 return <dialog ref={dialog} className="confirmation-dialog" aria-labelledby="logout-title" aria-describedby="logout-description" onCancel={onCancel}><h2 id="logout-title">Are you sure you want to log out?</h2><p id="logout-description">You will need to log in again to access your workspace.</p><div className="button-row"><button autoFocus onClick={onCancel}>Cancel</button><button className="purple" onClick={onConfirm}>Yes, log out</button></div></dialog>;
}
