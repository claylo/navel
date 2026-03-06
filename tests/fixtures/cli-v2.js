// Fixture: simulates minified cli.js for version "2.0.5"
// Adds: 1 new local command (voice), 1 new hook (PostToolUse)
// Retains all commands from v1 (except still has private/mcp__)

var Nj=()=>{},pN6=function(){return{type:"local",name:"clear",handler:()=>{}};},xQ=function(){return{type:"local",name:"compact",handler:()=>{}};},aB=function(){return{type:"local",name:"color",handler:()=>{}};};
var vV=function(){return{type:"local",name:"voice",handler:()=>{}};};
var jK=function(){return{type:"local-jsx",name:"help",render:()=>{}};},mT=function(){return{type:"local-jsx",name:"config",render:()=>{}};};
var pT=function(){return{type:"prompt",name:"commit",prompt:"create commit"};},qR=function(){return{type:"prompt",name:"mcp__",prompt:"mcp routing"};};
var sK={name:"review",description:"Review code changes",allowedTools:["read"],contentLength:0,isEnabled:()=>!0,isHidden:!1,progressMessage:"reviewing",userFacingName(){return"review"},source:"builtin",async getPromptForCommand(){return"review"}};
var cL={name:"claude-local",version:"0.0.1",private:!0,type:"prompt",name:"claude-local"};
var hooks={PreToolUse:{summary:"Before tool execution",handler:()=>{}},PostToolUse:{summary:"After tool execution",handler:()=>{}},SessionStart:{summary:"When a new session is started",handler:()=>{}}};
