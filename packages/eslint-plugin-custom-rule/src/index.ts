import { TSESLint } from '@typescript-eslint/utils';
import * as myRules from './myRule';

let myRulesTyped = myRules as Record<string, TSESLint.RuleModule<string, Array<unknown>>>
const rules = {
  
} as Record<string, TSESLint.RuleModule<string, Array<unknown>>>;
for(let key of Object.keys(myRulesTyped)){
  const rule = myRulesTyped[key];
  if(rule){
    rules[key] = rule;
  }
}
export {rules};