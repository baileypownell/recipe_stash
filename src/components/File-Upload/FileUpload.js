import React from 'react'
import './FileUpload.scss'
const { v4: uuidv4 } = require('uuid')

class FileUpload extends React.Component {

    state = {
        files: [],
        preExistingImageUrls: null,
        filesToDelete: []
    }

    componentDidMount() {
        this.props.preExistingImageUrls.subscribe(preExistingImageUrls => {
            this.setState({
                preExistingImageUrls: preExistingImageUrls
            })
        })
    }
    
    openFileFinder = () => this.input.click()

    handleDrop(e) {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.files && e.dataTransfer.items.length >=1 ) {
            let currentFiles = this.state.files
            Array.from(e.dataTransfer.files).forEach(file => {
                if (file.type === 'image/jpeg' || file.type === 'image/png') {
                    currentFiles.push({
                        file: file,
                        id: uuidv4()
                    })
                }
            })
            this.setState({
                files: currentFiles
            }, () => {
                this.props.passFiles(this.state.files)
            })
        }
    }

    handleUpload = (e) => {
        let currentFiles = this.state.files
        Array.from(e.target.files).forEach(file => {
            if (this.state.files.length + this.state.preExistingImageUrls?.length === 5) {
                M.toast({html: 'Only 5 images allowed per recipe.'})
                return
            }
            if ((file.type === 'image/jpeg' || file.type === 'image/png') && this.state.files.length <= 4) {
                currentFiles.push({
                    file: file,
                    id: uuidv4()
                })
            }
        })
        this.setState({
            files: currentFiles
        }, () => {
            this.props.passFiles(this.state.files)
        })
    }

    removeFile(fileId) {
        let updatedFileList = [] 
        this.state.files.forEach(file => {
            if (file.id !== fileId) {
                updatedFileList.push(file)
            }
        })
        this.setState({
            files: updatedFileList
        }, () => {
            this.props.passFiles(this.state.files)
        })
    }

    stageAWSFileDeletion(url) {    
        let updatedFiles = this.state.preExistingImageUrls.filter(u => u !== url) 
        let filesToDelete = this.state.filesToDelete
        filesToDelete.push(url) 
        this.setState({
            preExistingImageUrls: updatedFiles,
            filesToDelete: filesToDelete
        }, () => { 
            this.props.passFilesToDelete(filesToDelete)
        })
    }

    input = React.createRef()

    render() {
        const { preExistingImageUrls, files } = this.state
        return (
            <div className="file-upload">
                <div className="dropzone" onDrop={this.handleDrop} onDragOver={this.handleDrop}>
                    <input 
                        ref={i => this.input = i} 
                        type="file" 
                        id="input" 
                        disabled={files.length + preExistingImageUrls?.length === 5}
                        onChange={this.handleUpload}
                        multiple>
                    </input>
                    <div>
                        <h1>Drag & Drop an image</h1>
                        <button 
                            onClick={this.openFileFinder} 
                            disabled={files.length + preExistingImageUrls?.length === 5} 
                            className="waves-effect waves-light btn">Choose a file</button>
                        <span>(Limit 5)</span>
                        <i className="fas fa-file-upload"></i>
                    </div>
                </div>
                <div className="file-list">
                    {Array.from(files)?.map(file => (
                        <div 
                            key={file.id}
                            className="file-preview z-depth-2" 
                            style={{ backgroundImage: `url(${URL.createObjectURL(file.file)})`  }}>
                            <div className="file-cover" >
                                <i onClick={(e) => this.removeFile(file.id)} className="fas fa-trash"></i>
                            </div>
                        </div>
                    ))}
                    {preExistingImageUrls?.map(url => (
                        <div
                            className="file-preview z-depth-2"
                            key={url}
                            style={{ backgroundImage: `url(${url})`  }}>
                            <div className="file-cover" >
                                <i onClick={(e) => this.stageAWSFileDeletion(url)} className="fas fa-trash"></i>
                            </div>
                        </div>
                    ))}
                </div>              
            </div>
        )
    }
}

export default FileUpload