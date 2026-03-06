// Fixture: simulates minified cli.js for version "2.0.0"
// Contains: 3 local commands, 2 local-jsx, 1 prompt, 1 skill-registered
// Also: 1 mcp__ command (should be filtered), 1 private command (should be filtered)
// Also: 2 hooks

var Nj=()=>{},pN6=function(){return{type:"local",name:"clear",handler:()=>{}};},xQ=function(){return{type:"local",name:"compact",handler:()=>{}};},aB=function(){return{type:"local",name:"color",handler:()=>{}};};
var jK=function(){return{type:"local-jsx",name:"help",render:()=>{}};},mT=function(){return{type:"local-jsx",name:"config",render:()=>{}};};
var pT=function(){return{type:"prompt",name:"commit",prompt:"create commit"};},qR=function(){return{type:"prompt",name:"mcp__",prompt:"mcp routing"};};
var sK={name:"review",description:"Review code changes",allowedTools:["read"],contentLength:0,isEnabled:()=>!0,isHidden:!1,progressMessage:"reviewing",userFacingName(){return"review"},source:"builtin",async getPromptForCommand(){return"review"}};
var cL={name:"claude-local",version:"0.0.1",private:!0,type:"prompt",name:"claude-local"};
var hooks={PreToolUse:{summary:"Before tool execution",handler:()=>{}},SessionStart:{summary:"When a new session is started",handler:()=>{}}};
