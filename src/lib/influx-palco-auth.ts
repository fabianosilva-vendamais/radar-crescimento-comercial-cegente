import {createHmac,scryptSync,timingSafeEqual} from "node:crypto";
export const COOKIE_PALCO="influx_palco_sessao";
const lifetimeMs=8*60*60*1000;
function safeEq(a:Buffer,b:Buffer){return a.length===b.length&&timingSafeEqual(a,b);}
export function confirmarCredenciais(email:string,senha:string){
 const requiredEmail=(process.env.INFLUX_KAREN_LOGIN_EMAIL||"").toLowerCase().trim();
 const secret=process.env.INFLUX_KAREN_LOGIN_SCRYPT||"";
 const [salt,hash]=secret.split(":");
 if(!requiredEmail||!salt||!hash||hash.length!==128) return false;
 const received=scryptSync(senha,salt,64);
 const expected=Buffer.from(hash,"hex");
 const correctPassword=safeEq(received,expected);
 const correctEmail=safeEq(Buffer.from(email.trim().toLowerCase()),Buffer.from(requiredEmail));
 return correctPassword&&correctEmail;
}
function sessionKey(){return process.env.INFLUX_KAREN_SESSION_SECRET||"";}
function signature(payload:string){
 return createHmac("sha256",sessionKey()).update(payload).digest("base64url");
}
export function criarSessao(){
 if(!sessionKey())throw Error("Credencial de sessão não configurada");
 const payload=Buffer.from(JSON.stringify({sub:"karen-palco",exp:Date.now()+lifetimeMs})).toString("base64url");
 return payload+"."+signature(payload);
}
export function sessaoValida(cookie:string|null|undefined){
 if(!cookie||!sessionKey())return false;
 const parts=cookie.split(".");
 if(parts.length!==2||!parts[0]||!parts[1])return false;
 const sig=Buffer.from(parts[1]),expected=Buffer.from(signature(parts[0]));
 if(!safeEq(sig,expected))return false;
 try{
  const body=JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8"));
  return body.sub==="karen-palco"&&Number.isFinite(body.exp)&&body.exp>Date.now()&&body.exp<Date.now()+lifetimeMs+60000;
 }catch{return false;}
}
