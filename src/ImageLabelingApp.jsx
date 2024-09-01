import React, { useState, useRef, useEffect } from "react";
import { Upload, Button, message, Select } from "antd";
import JSZip from "jszip";
import { InboxOutlined, DeleteOutlined} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";
import CanvasComponent from "./CanvasComponent";
//import { Header } from "antd/es/layout/layout";

const { Dragger } = Upload;
const { Option } = Select;

const ImageLabelingApp = () => {
  const [imageSrcs, setImageSrcs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDragger, setShowDragger] = useState(true);
  const canvasRef = useRef(null);

  const handleUpload = (file) => {
    const zip = new JSZip();
    zip.loadAsync(file).then((zipContent) => {
      const pngFiles = Object.keys(zipContent.files).filter((fileName) => {
        return fileName.endsWith(".png") && !fileName.startsWith("__MACOSX/") && !fileName.startsWith("."); // to prevent MACOS files
      });
      if (pngFiles.length > 0) {
        const imagePromises = pngFiles.map((pngFile) =>
          zipContent
            .file(pngFile)
            .async("blob")
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              return { url, fileName: pngFile };
            })
        );
        Promise.all(imagePromises).then((images) => {
          setImageSrcs(images);
          setSelectedImage(images[0].url); // Set the first image selected by default
          setShowDragger(false);
        });
      } else {
        message.error("No PNG file found in the ZIP!");
      }
    });
    return false;
  };

  const handleDelete = () => {
    setImageSrcs([]);
    setSelectedImage(null);
    setShowDragger(true);
  };

  const handleImageSelect = (url) => {
    setSelectedImage(url);
  };

  const uploadProps = {
    name: "file",
    accept: ".zip",
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = selectedImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [selectedImage]);

  return (
    <div className="app-container">
      {showDragger && (
        <Dragger {...uploadProps} className="upload-container">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Only .zip files with PNG images are allowed</p>
        </Dragger>
      )}

      {imageSrcs.length > 0 && (
        <div className="canvas-container">
          <CanvasComponent imageSrc={selectedImage} />
          <div className="button-group">
          <Select
              style={{ width: 150, marginTop: 16 ,marginRight:15}}
              placeholder="Select an image"
              value={selectedImage && imageSrcs.find(img => img.url === selectedImage)?.fileName}
              onChange={(fileName) => {
                const selectedImageObj = imageSrcs.find(img => img.fileName === fileName);
                handleImageSelect(selectedImageObj.url);
              }}
            >
              {imageSrcs.map((image) => (
                <Option key={image.fileName} value={image.fileName}>
                  {image.fileName}
                </Option>
              ))}
            </Select>
              <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              className="delete-button"
              onClick={handleDelete}
            >
              </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLabelingApp;
