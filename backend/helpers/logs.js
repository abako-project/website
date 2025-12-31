

exports.log = (obj, title, dirname, filename) => {
    console.log("=======" , title, "========");
    dirname && console.log("[D" , dirname, "]");
    filename && console.log("[F" , filename, "]");
    console.log(JSON.stringify(obj, undefined, 2));
    console.log("======================");
};
