import React from 'react';
import ImageUploader from 'react-images-upload';


const now = new Date()
let secondsSinceEpoch = Math.round(now.getTime() / 1000);

export default class ImgUploaderer extends React.Component {

    constructor() {
        super();
        this.state = {
            pictures: [], ok2Upld: false, uploaded: false,
            text: 'Please choose 4 images of Earth from your computer 🌎', DayNb: 1, evtSrc: null,
            wsocket: null,
            registered: false,
            resImage: [],
            downloadedAll: false,
            intervalRef: null,
            msgAnim: ""
        };
        //this.onDrop = this.onDrop.bind(this);
        //this.handleChange = this.handleChange.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.modifyDays = this.modifyDays.bind(this);
        this.handleDownloadCSV = this.handleDownloadCSV.bind(this);
    }

    handleDownloadCSV() {
        let options = {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": 'attachment; filename="picture.png"'
        }
        for(let i = 0; i < this.state.DayNb; i++)
        {
            fetch('/getCSV').then(response => {
                response.blob().then(blob => {
                    let url = URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = `coords_${i}.csv`;
                    a.click();
                })
            });
        }



    }

    modifyDays(e) {
        let element = e.target;
        if (element.scrollHeight - element.scrollTop === element.clientHeight)
            this.setState(prevState => (
                {
                    ...prevState,
                    DayNb: prevState.DayNb + 1
                }
            ))
    }

    registerUser() {
        const options = {
        };
        return new Promise((resolve, reject) => {
            if (this.state.registered === true) {
                resolve();
            }
            fetch('register', options)
                .then(res => {
                    if (res.status == 200) {
                        resolve();
                    } else {
                        reject();
                    }
                });
        });
    }

    uploadImages(formData) {
        // upload images
        const options = {
            method: 'POST',
            body: formData,
            // If you add this, upload won't work
            // headers: {
            // 'Content-Type': 'multipart/form-data',
            //}
        };
        return new Promise((resolve, reject) => {
            fetch('/upload', options)
                .then(res => {
                    resolve();
                })
                .catch(res => {
                    console.log(res.status);
                    reject();
                });
        });
    }

    getImages() {
        const options = {};
        return new Promise((resolve, reject) => {
            fetch('/finishedImages', options)
                .then(res => res.blob())
                .then(image => {
                    const imgLink = URL.createObjectURL(image);
                    resolve(imgLink);
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }

    handleUpload() {
        this.registerUser()
            .then(() => {
                if (this.state.ok2Upld === true) {
                    const iRef = setInterval(() => {
                        let aux = this.state.msgAnim;
                        aux += '🔥';
                        if (aux.length === 4 * '🔥'.length)
                            aux = '';
                        this.setState(prevState => (
                            {
                                ...prevState,
                                msgAnim: aux
                            }
                        ))
                    }, 1000);

                    this.setState(prevState => (
                        {
                            ...prevState,
                            text:`Images uploaded. Server processing! Estimated time ${25 * this.state.DayNb + 20 + Math.floor(Math.random() * this.state.DayNb * 2.71)} seconds  `,
                            uploaded: true,
                            intervalRef: iRef
                        }
                    ))


                    const formData = new FormData();
                    formData.append('number', this.state.DayNb);
                    formData.append('filez', this.state.pictures[0]);
                    formData.append('filez', this.state.pictures[1]);
                    formData.append('filez', this.state.pictures[2]);
                    formData.append('filez', this.state.pictures[3]);


                    // open socket
                    if (!this.state.wsocket || !this.state.wsocket.readyState === WebSocket.OPEN) {
                        let ws;
                        console.log(process.env.NODE_ENV);
                        if (process.env.NODE_ENV === 'production') {
                            ws = new WebSocket('wss://alvoxel.com:8443');
                        } else {
                            ws = new WebSocket('ws://localhost:8000'); // secure websocket
                        }

                        this.setState(prevState => (
                            {
                                ...prevState,
                                wsocket: ws
                            }));

                        ws.addEventListener('open', (event) => {
                            ws.send('Hello Server!');
                            //sending images for first time
                            console.log();
                            this.uploadImages(formData);
                        });

                        ws.addEventListener('message', (event) => {
                            console.log(event.data);

                            // call fetch result on server now!!!
                            const data = JSON.parse(event.data);
                            if (data) {
                                if (data.type === 'signal' && data.payload === 'getResult') {

                                    for (let i = 0; i < this.state.DayNb; i++) {
                                        this.getImages()
                                            .then(imglink => {
                                                this.setState(prevState => (
                                                    {
                                                        ...prevState,
                                                        resImage: [...prevState.resImage, imglink]
                                                    }));
                                                if (i === this.state.DayNb - 1) {
                                                    this.setState(prevState => (
                                                        {
                                                            ...prevState,
                                                            downloadedAll: true,
                                                            text: 'These are your predicted images',
                                                            msgAnim:''
                                                        }
                                                    ))
                                                    clearInterval(this.state.intervalRef);
                                                }

                                            });
                                    }

                                }
                            }

                        });
                    } else {
                        //already open, uploading new set new procedure start
                        // upload images
                        this.uploadImages(formData);
                    }
                }
                else {
                    this.setState(prevState => (
                        {
                            ...prevState,
                            text: 'You did not upload 4 images :('
                        }
                    ))
                }
            });
    }

    handleChange(event) {
        const maxDays = 5;
        const { name, value } = event.target;
        if (name == 'DayNb') {
            if (value !== '') {
                let i = value;
                if (value < 1)
                    i = 1;
                else
                    if (value > maxDays)
                        i = maxDays;
                this.setState(prevState => (
                    {
                        ...prevState,
                        DayNb: i
                    }
                ))
            }
            else {
                this.setState(prevState => (
                    {
                        ...prevState,
                        DayNb: ""
                    }
                ))
            }

        }
        else {
            this.setState(prevState => (
                {
                    ...prevState,
                    [name]: value
                }
            ))
        }
    }



    componentDidMount() {
        const fileSelector = document.getElementById('file-selector');
        fileSelector.addEventListener('change', (event) => {
            const fileList = event.target.files;
            if (fileList.length != 4) {
                this.setState(prevState => (
                    {
                        ...prevState,
                        text: 'You must upload exactly 4 images!'
                    }
                ))
            }
            else {
                this.setState(prevState => (
                    {
                        ...prevState,
                        ok2Upld: true,
                        pictures: fileList,
                        text: 'Images ready for upload ⬆️'
                    }
                ))
            }
        });
    }

    render() {
        if (this.state.uploaded === false) {
            return (
                <div>
                    <p className='HeaderPar'>{this.state.text}</p>
                    <div className='FormItems'>
                        <div>
                            <input type="file" id="file-selector" multiple className='Upld-Butt' />
                            <label for="file-selector" className='File-Label'>Choose a files...</label>
                        </div>
                        <div>
                            <label for="DayNb" className='NormalLabel'>Days to predict:</label>
                            <input type='number' name='DayNb' onChange={this.handleChange} value={this.state.DayNb} className='quantity'></input>
                        </div>
                        <button name="UploadButton" onClick={this.handleUpload} className='Submit-Butt'>
                            UPLOAD
                </button>

                    </div>
                </div>

            );
        }
        else {
            return (

                <div>

                    <p>
                        {this.state.text}
                    </p>
                    <p>{this.state.msgAnim} </p>
                    <div className='Img-Container'>
                        {
                            this.state.resImage.map(el =>
                                (<div><img src={el} width="700px" /></div>)
                            )
                        }
                    </div>
                    {
                        this.state.downloadedAll === true ?
                            <button name="ButtonDownloadCSV"
                                className='Submit-Butt' onClick={this.handleDownloadCSV}>Download CSV</button> : null



                    }
                </div>

            )
        }

    }
}