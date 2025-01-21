import React, { useEffect, useRef, useState } from 'react';
import data from './data';
import { nodeType } from './data';
const TimelineCanvas = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  
  // 添加更多预定义的颜色数组
  const REGION_COLORS = [
    'rgba(255, 228, 181, 0.5)',  // 浅杏色
    'rgba(176, 224, 230, 0.5)',  // 浅粉蓝色
    'rgba(221, 160, 221, 0.5)',  // 浅紫色
    'rgba(144, 238, 144, 0.5)',  // 浅绿色
    'rgba(255, 182, 193, 0.5)',  // 浅粉色
    'rgba(255, 218, 185, 0.5)',  // 浅桃色
    'rgba(230, 230, 250, 0.5)',  // 薰衣草色
    'rgba(175, 238, 238, 0.5)',  // 浅绿松石色
    'rgba(255, 240, 245, 0.5)',  // 淡紫红色
    'rgba(240, 248, 255, 0.5)',  // 爱丽丝蓝
    'rgba(245, 222, 179, 0.5)',  // 小麦色
    'rgba(188, 210, 238, 0.5)',  // 浅钢蓝
  ];

  // 计算每个时间段的宽度和总宽度
  const PIXELS_PER_YEAR = 1; // 每年占用的像素数
  const segmentWidths = data.map(segment => 
    Math.abs(segment.endYear - segment.startYear) * PIXELS_PER_YEAR
  );
  const totalWidth = segmentWidths.reduce((sum, width) => sum + width, 0);

  // 添加用于生成随机位置的函数
  const generateRandomPosition = (baseY, usedPositions, isAbove, regionHeight) => {
    const range = regionHeight / 2;
    const minDistanceEvents = 80; // 事件之间的最小间距
    const minDistanceAxis = 40;   // 与时间轴的最小间距
    const minDistanceBorder = 30; // 与区域边界的最小间距
    let attempts = 0;
    const maxAttempts = 10;
    
    // 计算区域的上下边界
    const topBorder = baseY - regionHeight / 2 + minDistanceBorder;
    const bottomBorder = baseY + regionHeight / 2 - minDistanceBorder;
    
    while (attempts < maxAttempts) {
      const randomOffset = isAbove ? 
        -Math.random() * (range - minDistanceBorder - minDistanceAxis) - minDistanceAxis : 
        Math.random() * (range - minDistanceBorder - minDistanceAxis) + minDistanceAxis;
      const newY = baseY + randomOffset;
      
      // 检查是否与已有位置冲突，是否太靠近轴线，以及是否超出边界
      const hasConflict = usedPositions.some(pos => 
        Math.abs(pos - newY) < minDistanceEvents
      ) || Math.abs(newY - baseY) < minDistanceAxis ||
      newY < topBorder || newY > bottomBorder;
      
      if (!hasConflict) {
        usedPositions.push(newY);
        return newY;
      }
      attempts++;
    }
    
    // 如果找不到合适位置，返回一个安全的默认位置
    return baseY + (isAbove ? 
      Math.max(-(regionHeight/2 - minDistanceBorder), -(minDistanceAxis + attempts * 5)) : 
      Math.min(regionHeight/2 - minDistanceBorder, minDistanceAxis + attempts * 5));
  };

  useEffect(() => {
    const container = containerRef.current;
    
    const handleWheel = (e) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // 计算总高度
    const totalHeight = Math.max(...data.map(seg => 
      seg.regions.reduce((sum, region) => sum + region.height, 0)
    ));
    
    canvas.height = totalHeight * dpr;
    canvas.width = totalWidth * dpr;
    
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // 存储所有事件的位置信息，用于检测hover
    const eventPositions = [];

    // 绘制每个段落
    let currentX = 0;
    let lastUsedColors = new Set();

    data.forEach((segment, segmentIndex) => {
      const segmentWidth = segmentWidths[segmentIndex];
      let currentY = 0;

      // 为当前段落选择可用的颜色（避免与上一个段落使用相同的颜色）
      const availableColors = REGION_COLORS.filter(color => !lastUsedColors.has(color));
      lastUsedColors.clear(); // 清除上一次的记录

      // 绘制区域背景
      segment.regions.forEach((region, regionIndex) => {
        // 确保不使用上一个区域用过的颜色
        let colorIndex = regionIndex % availableColors.length;
        const regionColor = availableColors[colorIndex];
        lastUsedColors.add(regionColor);
        ctx.fillStyle = regionColor;
        
        // 绘制带波浪边缘的区域背景
        ctx.beginPath();
        const waveHeight = 20;
        const waveWidth = 100;
        const steps = Math.floor(segmentWidth / waveWidth);
        
        ctx.moveTo(currentX, currentY);
        
        // 绘制上边缘波浪
        for (let i = 0; i <= steps; i++) {
          const x = currentX + i * waveWidth;
          ctx.bezierCurveTo(
            x + waveWidth/4, currentY - waveHeight,
            x + (waveWidth*3)/4, currentY - waveHeight,
            x + waveWidth, currentY
          );
        }
        
        ctx.lineTo(currentX + segmentWidth, currentY);
        ctx.lineTo(currentX + segmentWidth, currentY + region.height);
        ctx.lineTo(currentX, currentY + region.height);
        ctx.closePath();
        ctx.fill();

        // 绘制时间线
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(currentX, currentY + region.height/2);
        ctx.lineTo(currentX + segmentWidth, currentY + region.height/2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制区域标签
        ctx.fillStyle = '#000';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(region.label, currentX + 10, currentY + 20);

        // 绘制事件
        const eventsByYear = (region.events || []).reduce((acc, event) => {
          if (!acc[event.year]) {
            acc[event.year] = [];
          }
          acc[event.year].push({...event, regionY: currentY, regionHeight: region.height});
          return acc;
        }, {});

        Object.entries(eventsByYear).forEach(([year, events]) => {
          const yearNum = parseInt(year);
          const yearPosition = (yearNum - segment.startYear) / 
            (segment.endYear - segment.startYear);
          const x = currentX + yearPosition * segmentWidth;
          
          const usedPositions = [];

          events.forEach((event, eventIndex) => {
            const baseY = event.regionY + event.regionHeight/2;
            const offsetX = (eventIndex - (events.length - 1) / 2) * 60;
            const finalX = x + offsetX;

            let finalY;
            if (event.type === nodeType.leader || event.type === nodeType.king) {
              finalY = baseY;
            } else {
              const isAbove = Math.random() > 0.5;
              finalY = generateRandomPosition(baseY, usedPositions, isAbove, event.regionHeight);
            }

            // 存储事件位置信息
            eventPositions.push({
              x: finalX,
              y: finalY,
              radius: 15, // 点击检测范围
              event: {
                ...event,
                text: event.text,
                year: yearNum,
                type: event.type
              }
            });

            // 绘制事件图标
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(event.type || '⭕️', finalX, finalY);

            // 只为leader和king类型或当前hover的事件绘制文本
            if (event.type === nodeType.leader || 
                event.type === nodeType.king ||
                (hoveredEvent && 
                 hoveredEvent.x === finalX && 
                 hoveredEvent.y === finalY)) {
              ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              const textOffsetY = finalY > baseY ? 20 : -20;
              ctx.fillText(event.text, finalX, finalY - textOffsetY);
              ctx.fillText(`(${Math.abs(yearNum)}BCE)`, finalX, finalY - textOffsetY * 1.75);
            }
          });
        });

        currentY += region.height;
      });

      // 绘制年份标记
      ctx.fillStyle = '#000';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.abs(segment.startYear)}BCE - ${Math.abs(segment.endYear)}BCE`,
        currentX + segmentWidth / 2,
        totalHeight - 10
      );

      currentX += segmentWidth;
    });

    // 添加鼠标移动事件处理
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);

      // 检查是否hover在任何事件上
      const hoveredPos = eventPositions.find(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) < pos.radius;
      });

      if (hoveredPos !== hoveredEvent) {
        setHoveredEvent(hoveredPos);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scrollPosition, hoveredEvent]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div 
        ref={containerRef}
        className="overflow-x-auto border border-gray-200 rounded-lg"
        onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
      >
        <canvas
          ref={canvasRef}
          style={{ 
            height: `${Math.max(...data.map(seg => 
              seg.regions.reduce((sum, region) => sum + region.height, 0)
            ))}px`,
            cursor: hoveredEvent ? 'pointer' : 'default'
          }}
        />
      </div>
    </div>
  );
};

export default TimelineCanvas;