import React from 'react'
import './FileUpload.scss'
const { v4: uuidv4 } = require('uuid')

class FileUpload extends React.Component {

    state = {
        files: []
    }
    
    openFileFinder = () => {
        this.input.click()
    }

    handleDrop = (e) => {
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
            })
        }
    }

    handleUpload = (e) => {
        let currentFiles = this.state.files
        Array.from(e.target.files).forEach(file => {
            if (this.state.files.length === 5) {
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
        })
    }

    removeFile = (fileId) => {
        let updatedFileList = [] 
        this.state.files.forEach(file => {
            if (file.id !== fileId) {
                updatedFileList.push(file)
            }
        })
        this.setState({
            files: updatedFileList
        })
    }

    input = React.createRef()

    render() {
        return (
            <div className="file-upload">
                <div className="dropzone" onDrop={this.handleDrop} onDragOver={this.handleDrop}>
                <input 
                    ref={i => this.input = i} 
                    type="file" 
                    id="input" 
                    disabled={this.state.files.length === 5}
                    onChange={this.handleUpload}
                    multiple>
                 </input>
                    <div>
                        <h1>Drag & Drop an image</h1>
                        <button 
                            onClick={this.openFileFinder} 
                            disabled={this.state.files.length === 5} 
                            className="waves-effect waves-light btn">Choose a file</button>
                        <span>(Limit 5)</span>
                        <i className="fas fa-file-upload"></i>
                    </div>
                    
                </div>

                { this.state.files.length > 0 || this.props.preExistingImageUrls.length > 0 ?
                    <div className="file-list">
                        <>
                            {Array.from(this.state.files).map(file => {
                                return (
                                    <div 
                                        className="file-preview z-depth-2" 
                                        style={{ backgroundImage: `url(${URL.createObjectURL(file.file)})`  }}>
                                        <div className="file-name" >
                                            <span>{file.file?.name}</span> 
                                            <i onClick={(e) => this.removeFile(file.id)} className="fas fa-trash"></i>
                                        </div>
                                    </div>
                                )
                            })}

                            {
                                this.props.preExistingImageUrls.map(url => {
                                    return ( 
                                        <div
                                            className="file-preview z-depth-2"
                                            style={{ backgroundImage: `url(${url})`  }}>
                                            <div className="file-name" >
                                                
                                                <i onClick={(e) => this.removeFile()} className="fas fa-trash"></i>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </>
                    </div>
                : null}
            </div>
        )
    }
}

export default FileUpload