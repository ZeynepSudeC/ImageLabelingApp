import React, { useRef, useEffect, useState } from "react";
import { Card, Button, Tooltip} from "antd";
import { SketchOutlined, UndoOutlined,CloseSquareOutlined, ZoomInOutlined,ZoomOutOutlined,DownloadOutlined} from "@ant-design/icons";
import JSZip from "jszip";
import FileSaver from "file-saver";


const CanvasComponent = ({ imageSrc, fileName }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [strokes, setStrokes] = useState([]); // Store individual strokes
  const [currentStroke, setCurrentStroke] = useState([]); // Store the current stroke being drawn
  const [scale, setScale] = useState(1); // Zoom scale
  const [zoomOutDisabled, setZoomOutDisabled] = useState(true); // Disable Zoom Out initially
  const [zoomInDisabled, setZoomInDisabled] = useState(false); // Enable Zoom In
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 }); // Default dimensions
  
  const thresholdDistance = 10; // can change
  const maxScale = 3; // Maximum zoom in scale
  const minScale = 1; // Minimum zoom out scale

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      setCtx(context);

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        
        canvas.width = img.width; // Set canvas dimensions to match the image
        canvas.height = img.height;
        setCanvasDimensions({ width: img.width, height: img.height });

        context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous image
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [imageSrc]);

  useEffect(() => {
    // Redraw the image if the canvas size or scale changes
    if (ctx && imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
    }
  }, [canvasDimensions,scale,ctx,imageSrc]);

  // Start drawing
  const startDrawing = (e) => {
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setCurrentStroke([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]); // Initialize current stroke with starting point
      setIsDrawing(true);
    }
  };

  // Draw on canvas and track the current stroke
  const draw = (e) => {
    if (isDrawing && ctx) {
      const { offsetX, offsetY } = e.nativeEvent;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      setCurrentStroke((prevStroke) => [...prevStroke, { x: offsetX, y: offsetY }]); // Append new point to current stroke
    }
  };

  // Calculate the distance between two points
  const calculateDistance = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };

  // Stop drawing and check if the stroke is closed
  const stopDrawing = () => {
    if (isDrawing && ctx) {
      const startingPoint = currentStroke[0];
      const endingPoint = currentStroke[currentStroke.length - 1];

      // Check if the starting and ending points are close to each other
      const distance = calculateDistance(startingPoint, endingPoint);
      if (distance <= thresholdDistance) {
        // Close the path and fill the area
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Set fill color, red green blue alfa

        // Fill the drawn path
        ctx.beginPath();
        currentStroke.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.fill(); // Automatically fill the closed path

        setStrokes((prevStrokes) => [...prevStrokes, currentStroke]); // Save the current stroke to the strokes array
      } else {
        // If the points are not close enough discard the stroke
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Redraw the image
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Redraw all remaining strokes
          strokes.forEach((stroke) => {
            ctx.beginPath();
            stroke.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.closePath();
            ctx.stroke();
            ctx.fill(); // Automatically fill the closed path
          });
        };
      }

      setIsDrawing(false);
      setCurrentStroke([]); // Clear the current stroke
    }
  };

  // Undo the lasts
  const undoLastStroke = () => {
    if (strokes.length > 0) {
      const newStrokes = strokes.slice(0, -1); // Remove the last stroke from the strokes array
      setStrokes(newStrokes);

      // Clear the canvas and redraw all remaining strokes
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Redraw the image
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Redraw all remaining strokes
        newStrokes.forEach((stroke) => {
          ctx.beginPath();
          stroke.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.closePath();
          ctx.stroke();
          ctx.fill(); // Automatically fill the closed path.
        });
      };
    }
  };

  // Reset the canvas and clear all strokes
  const resetCanvas = () => {
    setStrokes([]); // Clear the strokes array

    // Clear the canvas and redraw the image
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      console.log(img);
    };
  };
  // Zoom In
  const zoomIn = () => {
    if (scale < maxScale) {
      const newScale = scale + 0.5;
      setScale(newScale);

      if (newScale > minScale) {
        setZoomOutDisabled(false); // Enable Zoom Out
      }

      if (newScale >= maxScale) {
        setZoomInDisabled(true); // Disable Zoom In when max scale reached
      }

      // Adjust canvas size based on new scale
      canvasRef.current.style.transform = `scale(${newScale})`;
      canvasRef.current.style.transformOrigin = "0 0";

      // Enable scrollbars
      containerRef.current.style.overflow = "scroll";
    }
  };

  // Zoom Out
  const zoomOut = () => {
    if (scale > minScale) {
      const newScale = scale - 0.5;
      setScale(newScale);

      if (newScale <= minScale) {
        setZoomOutDisabled(true); // Disable Zoom Out when min scale reached
        containerRef.current.style.overflow = "hidden"; // Disable scrollbars at min scale
      }

      if (newScale < maxScale) {
        setZoomInDisabled(false); // Enable Zoom In
      }

      // Adjust canvas size based on new scale
      canvasRef.current.style.transform = `scale(${newScale})`;
      canvasRef.current.style.transformOrigin = "0 0";
    }
  };

  // Export function
  const exportFiles = () => {
    const zip = new JSZip();
    const canvas = canvasRef.current;

    // Export the manipulated image
    const imageData = canvas.toDataURL("image/png");
    zip.file("manipulated_image.png", imageData.split(",")[1], { base64: true });

    // Create the labeling mask
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    maskCtx.fillStyle = "transparent";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    strokes.forEach((stroke) => {
      maskCtx.beginPath();
      stroke.forEach((point, index) => {
        if (index === 0) {
          maskCtx.moveTo(point.x, point.y);
        } else {
          maskCtx.lineTo(point.x, point.y);
        }
      });
      maskCtx.closePath();
      maskCtx.fillStyle = "rgba(0, 0, 0, 1)"; // Fill color for labeling mask
      maskCtx.fill();
    });

    // Export the labeling mask
    const maskImageData = maskCanvas.toDataURL("image/png");
    zip.file("labeling_mask.png", maskImageData.split(",")[1], { base64: true });

    // Generate and download the zip file
    zip.generateAsync({ type: "blob" }).then((content) => {
      FileSaver.saveAs(content, "exported_files.zip");
    });
  };

  return (
    <Card
      title={fileName} // Display the file name as the card title
      bordered={true}
      className="canvas-card"
    >
      <div className="tool-container">
      <Tooltip title="Draw">
          <Button
            icon={<SketchOutlined />}
            type="primary"
          />
        </Tooltip>
        <Tooltip title="Zoom In">
          <Button
            icon={<ZoomInOutlined />}
            onClick={zoomIn}
            disabled={zoomInDisabled} // Disable Zoom In button when max scale is reached
          />
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button
            icon={<ZoomOutOutlined />}
            onClick={zoomOut}
            disabled={zoomOutDisabled} // Disable Zoom Out button when min scale is reached
          />
        </Tooltip>
        <Tooltip title="Undo">
          <Button
            icon={<UndoOutlined />}
            onClick={undoLastStroke}
          />
        </Tooltip>
        <Tooltip title="Reset">
          <Button
            icon={<CloseSquareOutlined/>}
            onClick={resetCanvas}
          />
        </Tooltip>
        <Tooltip title="Export">
          <Button icon={<DownloadOutlined />}
          onClick={exportFiles} />
        </Tooltip>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing} // Stop drawing if the mouse leaves the canvas
        style={{ border: "1px solid #000" }}
      /></div>
    </Card>
  );
};

export default CanvasComponent;