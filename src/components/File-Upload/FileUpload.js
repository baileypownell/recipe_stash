import React from 'react'
import './FileUpload.scss';

function FileUpload(props) {
    return ( 
        <div className="file-upload">
            <div className="dropzone">
                <div>
                    <p>Upload an image</p>
                    <p>Accepted file types: JPG & PNG</p>
                    <i class="fas fa-file-upload"></i>
                </div>
                
            </div>
        </div>
    )
}

export default FileUpload