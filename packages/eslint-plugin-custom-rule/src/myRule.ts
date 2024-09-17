import { TSESLint, AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
/**
 * Write a rule to check that calls to removeListener(arg)
 * 1. arg should not be a declaration.
 * 2. arg should not be a useCallback()
 * 
 * Or a rule so that addEventListener() specifies where the removeListener is called.
 * spec: 
 * // removeEventListener@(filename or emptystring,line number)
 * m.addEventListener(...)
 */
type MessageIds = "messageIdForSomeFailure" | "messageIdForSomeOtherFailure";
type Context = Readonly<TSESLint.RuleContext<MessageIds, []>>;
function getCorrespondingCleanup(prevLine: string, context: Context):TSESTree.Node|undefined{
  if(!(prevLine.includes('//') && prevLine.includes('removeEventListener'))){
    return undefined;
  }
  const match = prevLine.match(/removeEventListener @ \((.*),(\d+)\)/);
  if(!match){
    return undefined;
  }
  let filename = match?.[1]
  const line = match?.[2]
  if(!(filename && line)){
    return undefined;
  }
  const lineInt = parseInt(line);
  const node = getNodeAtLineNumber(filename,lineInt,context);
  // lineStr = getLineNumberInFile(filename,line);
  return node;
}
const myRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    messages: {
      messageIdForSomeFailure: "Error message for some failure 1",
      messageIdForSomeOtherFailure: "Error message for some other failure",
    },
    schema: [], // no options
  },
  create: (context) => ({
    CallExpression: (node) => {
      if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
        const member = node.callee.property;
        if(member.type === AST_NODE_TYPES.Identifier){
          if (member.name === "addEventListener") {
            const lines = context.getSourceCode().lines;
            // one-based index in a zero-index array.
            const prevLine = lines[member.loc.start.line-2];
            if(prevLine){
              const correspondingCleanup = getCorrespondingCleanup(prevLine,context);
              if(!correspondingCleanup){
                return context.report({
                  node: node.callee,
                  messageId: "messageIdForSomeOtherFailure",
                });   
              }
              else{
                if(correspondingCleanup.type===AST_NODE_TYPES.MemberExpression){
                  const member = node.callee.property;
                  if(member.type === AST_NODE_TYPES.Identifier){
                    console.log(member.name)
                  }
                }      
              }
            }
          }
          else if (member.name === "removeEventListener") {
            return context.report({
              node: node.callee,
              messageId: "messageIdForSomeFailure",
            });
          } 
          else{

          }
          return;
        }
      }
      else if(node.callee.type === AST_NODE_TYPES.ArrowFunctionExpression){

      }

     

      return;
    },
  }),
};
function getNodeAtLineNumber(filename: string, line: number,context:Context):TSESTree.Node|undefined{
  if(filename!=='.'){
    return undefined;
  }
   const root = context.getAncestors()[0];
   if(!root){
    return undefined;
   }
   let foundNode:TSESTree.Node|undefined = undefined;
   function traverse(node:TSESTree.Node) {
    if(foundNode){return;}
    if (node.loc && node.loc.start.line === line) {
      foundNode = node;
      return;
    }
    // TODO: rewrite traverse function.
    const object = new Object(node);
    for (const key in object) {
      const field = object[key as keyof object];
      if ( field && typeof field === "object") {
        if(Array.isArray(field)){
          for(let child of field){
            traverse(child);
          }
        }
        else{
          traverse(field);
        }
      }
    }
  }
  traverse(root);
   return foundNode;
}

export {myRule};
  
