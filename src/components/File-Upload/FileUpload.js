import React from 'react'
import './FileUpload.scss';

class FileUpload extends React.Component {

    state = {
        files: []
    }
    
    openFileFinder = () => {
        input.click()
    }

    handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log(e.dataTransfer)
        if (e.dataTransfer.files && e.dataTransfer.items.length >=1 ) {
            console.log(e.dataTransfer.files)
            this.setState({
                files: e.dataTransfer.files
            }, () => console.log(this.state.files))
        }
    }

    removeFile = (file) => {
        // e.stopPropagation()
        // e.preventDefault()
        console.log(file)
    }

    input = React.createRef()

    render() {
        

        return (
            <div className="file-upload">
                <div className="dropzone" onDrop={this.handleDrop} onDragOver={this.handleDrop}>
                <input ref={i => this.input = i} type="file" id="input" multiple></input>
                    <div>
                    
                        <span><button onClick={this.openFileFinder} className="waves-effect waves-light btn">Choose a file</button> or drop one here</span>
                        <p>Accepted file types: JPG & PNG</p>
                        <i className="fas fa-file-upload"></i>
                    </div>
                    
                </div>

                { this.state.files.length > 0 ?
                <div class="file-list">
                    {Array.from(this.state.files).map(file => {
                        return <div class="file-name"><span>{file?.name}</span> <i onClick={(e) => this.removeFile(file)} className="fas fa-trash"></i></div>
                    })}
                 
                </div>
                : null}
            </div>
        )
    }
}

export default FileUpload