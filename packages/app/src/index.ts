class Element{
    addEventListener(eventName:string,listener:Function){}
    removeEventListener(listener:Function){}
}
const main = ()=>{
    const e = new Element();
    e.addEventListener('load',main);

}
const main2 = ()=>{
    const e = new Element();

    // removeEventListener @ (.,16)
    e.addEventListener('load',main2);

    e.removeEventListener(main2)
}
main();