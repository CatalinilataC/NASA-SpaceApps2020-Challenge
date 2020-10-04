
const exec = require("child_process").execSync;
var spawn = require("child_process").spawn;
const fs = require('fs');




function powerCommands(DayNb, resolve, reject, userCounter) {
    console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwww", userCounter);
    let usr = "utilizator1";
    let fireVal = 1.0;
    const dir = "/home/srv/nasa_interface/uploads/";
    const dirVid = "/home/srv/nasa_interface/uploads/Video1/";
    let filesPath = `/home/srv/nasa_interface/uploads/director${userCounter}/`;
    const preprocesarePath = "/home/srv/nasa_interface/process_files/preprocesare.py";
    const avgPath = "/home/srv/nasa_interface/predictor/Code/avg_runner.py";
    const detectPath = "/home/srv/nasa_interface/process_files/detect.py";
    const finalSrc = `../Save/${usr}/`
    const finalDest = "../FINAL_DESTINATION"; //de creat un folder FINAL_DESTINATION in folderul din care rulezi

    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });
    }
    
    if (!fs.existsSync("/home/srv/nasa_interface/numbers.txt"))
    {
        del.sync("/home/srv/nasa_interface/numbers.txt");
    }
    
    fs.writeFileSync('numbers.txt', `${userCounter}\n${DayNb}\n`);
    
    if (!fs.existsSync(dirVid))
    {
        fs.mkdirSync(dirVid, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });
    }
    
    /*fs.chmodSync(filesPath, 0777);
    
    
    const cp = require('child_process');
    
    let kid = cp.spawnSync("python3",[`${preprocesarePath}`, `${filesPath}`, `${dirVid}`]);
    
    console.log("python3" + `${preprocesarePath}` + filesPath + `${dirVid}`);
    console.log(kid.status, kid.stderr.toString(), kid.stdout.toString());
    
    
    //path     /home/srv/nasa_interface/pics     ${filesPath}
    
    
    //resolve();
    
    */
    
    
    
    let com1 = `python3 ${preprocesarePath} ${filesPath} ${dirVid}`;
    let com1_1 = `; Remove-Item -Recurse /home/srv/nasa_interface/uploads/director${userCounter}`;
    let com2 = `; python3 ${avgPath} -t ${dir} -T -n ${usr} -r ${DayNb}`;
    let com2_1 = '; cd process_files';
    
    let com3 = `; python3 ${detectPath} ${finalSrc} ${finalDest} ${fireVal}`;
    let com3_1 = '; cd ..';
    
    //console.log(com1+com1_1+com2);
    
    
    
    let child = spawn("bash",[`simple_bash.sh`, 1]);
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
