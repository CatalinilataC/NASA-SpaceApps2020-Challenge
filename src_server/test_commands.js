


const fs = require('fs');



// python .\detect.py D:\\projects_node\\nasa_interface\\pozele_de_la\\ D:\\projects_node\\nasa_interface\\poze_dest\\ 1.5

function powerCommands(DayNb, resolve, reject, userCounter) {
    console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwww", userCounter);
    let usr = "utilizator1";
    let fireVal = 1.05;
    const dir = "D:\\projects_node\\nasa_interface\\uploads\\";
    const dirVid = "D:\\projects_node\\nasa_interface\\uploads\\Video1\\";
    let filesPath = `D:\\projects_node\\nasa_interface\\uploads\\director${userCounter}\\`;
    const preprocesarePath = "D:\\projects_node\\nasa_interface\\process_files\\preprocesare.py";
    const avgPath = "D:\\projects_node\\nasa_interface\\predictor\\Code\\avg_runner.py";
    const detectPath = "D:\\projects_node\\nasa_interface\\process_files\\detect.py";
    const finalSrc = `..\\Save\\${usr}\\`
    const finalDest = "..\\FINAL_DESTINATION\\"; //de creat un folder FINAL_DESTINATION in folderul din care rulezi

    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });
    }
    if (!fs.existsSync(dirVid))
    {
        fs.mkdirSync(dirVid, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });
    }
    
    let com1 = `python ${preprocesarePath} ${filesPath} ${dirVid}`;
    let com1_1 = `; Remove-Item -Recurse D:\\projects_node\\nasa_interface\\uploads\\director${userCounter}`;
    let com2 = `; python ${avgPath} -t ${dir} -T -n ${usr} -r ${DayNb}`;
    let com2_1 = '; cd process_files';
    
    let com3 = `; python ${detectPath} ${finalSrc} ${finalDest} ${fireVal}`;
    let com3_1 = '; cd..';
    
    console.log(com1+com2);
    
    var spawn = require("child_process").spawn;
    let child = spawn("powershell.exe",[com1+com1_1+com2+com2_1+com3+com3_1]);
    //let child2 = spawn("powershell.exe",[`python ${avgPath} -t ${dir} -T -n utilizato7 -r 3`]);
    
    child.stdout.on("data",function(data){
        console.log("Powershell1 Data: " + data);
    });
    child.stderr.on("data",function(data){
        console.log("Powershell1 Errors: " + data);
        //return false;
    });
    child.on("exit",function(){
        console.log("Powershell1 Script finished");
        resolve();
    });
    child.stdin.end(); //end input
}


module.exports = powerCommands;
