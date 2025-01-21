import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';
import data from './data';
import { nodeType } from './data';

const REGION_COLORS = [
  'rgba(255, 228, 181, 0.3)',  // 更淡的杏色
  'rgba(176, 224, 230, 0.3)',  // 更淡的粉蓝色
  'rgba(221, 160, 221, 0.3)',  // 更淡的紫色
  'rgba(144, 238, 144, 0.3)',  // 更淡的绿色
  'rgba(255, 182, 193, 0.3)',  // 更淡的粉色
  'rgba(255, 218, 185, 0.3)',  // 更淡的桃色
  'rgba(230, 230, 250, 0.3)',  // 更淡的薰衣草色
  'rgba(175, 238, 238, 0.3)',  // 更淡的绿松石色
  'rgba(255, 240, 245, 0.3)',  // 更淡的紫红色
  'rgba(240, 248, 255, 0.3)',  // 更淡的爱丽丝蓝
  'rgba(245, 222, 179, 0.3)',  // 更淡的小麦色
  'rgba(188, 210, 238, 0.3)',  // 更淡的钢蓝
];

const PIXELS_PER_YEAR = 5;

const FIXED_TOTAL_HEIGHT = 1000; // Add this constant for the fixed total height

const TimelineCanvas = () => {
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [regionColors, setRegionColors] = useState({});
  const [nodePositions, setNodePositions] = useState({});
  const [visibleTypes, setVisibleTypes] = useState(
    Object.keys(nodeType).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [isLegendVisible, setIsLegendVisible] = useState(true);

  // 计算总宽度和每个段落的宽度
  const segmentWidths = data.map(segment => 
    Math.abs(segment.endYear - segment.startYear) * PIXELS_PER_YEAR
  );

  // Replace the totalHeight calculation with fixed height
  const totalHeight = FIXED_TOTAL_HEIGHT;

  // Calculate region heights based on number of regions in each segment
  const getRegionHeight = (segment) => {
    const numRegions = segment.regions.length;
    // Reserve 300px for top space and divide remaining height by number of regions
    return (FIXED_TOTAL_HEIGHT - 300) / numRegions;
  };

  useEffect(() => {
    // 设置高度为总高度加上300px的顶部空间
    setStageHeight(totalHeight + 300);
    
    const handleResize = () => {
      // 设置宽度为整个窗口宽度
      setStageWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalHeight]);

  const generateRegionPositions = (events, baseY, regionHeight) => {
    // 定义可用的垂直空间范围
    const padding = 30; // 与区域边界的最小距离
    const minY = baseY - regionHeight/2 + padding;
    const maxY = baseY + regionHeight/2 - padding;
    const minDistance = 40; // 节点之间的最小距离
    
    const positions = {};
    
    // 首先处理特殊节点（领袖和国王），将它们放在中轴线上
    events.forEach(event => {
      if (event.type === 'leader' || event.type === 'king') {
        positions[event.text] = baseY;
      }
    });
    
    // 处理其他类型的节点
    const remainingEvents = events.filter(event => 
      event.type !== 'leader' && event.type !== 'king'
    );
    
    // 为每个剩余事件寻找合适的位置
    remainingEvents.forEach(event => {
      let bestY = null;
      let minConflicts = Infinity;
      
      // 尝试多个位置
      for (let attempt = 0; attempt < 100; attempt++) {
        // 生成一个随机位置
        const candidateY = minY + Math.random() * (maxY - minY);
        let conflicts = 0;
        
        // 检查与现有位置的冲突
        for (const [existingText, existingY] of Object.entries(positions)) {
          const distance = Math.abs(candidateY - existingY);
          if (distance < minDistance) {
            conflicts++;
          }
        }
        
        // 更新最佳位置
        if (conflicts < minConflicts) {
          minConflicts = conflicts;
          bestY = candidateY;
        }
        
        // 如果找到没有冲突的位置，立即使用它
        if (conflicts === 0) {
          break;
        }
      }
      
      // 使用找到的最佳位置
      positions[event.text] = bestY;
    });
    
    return positions;
  };

  // Initialize nodePositions in useEffect to ensure it's only done once per region
  useEffect(() => {
    const initialPositions = {};
    data.forEach((segment, segmentIndex) => {
      let currentY = 0;
      segment.regions.forEach((region, regionIndex) => {
        const regionKey = `${segmentIndex}-${regionIndex}`;
        const regionHeight = getRegionHeight(segment);
        const baseY = currentY + regionHeight/2;
        initialPositions[regionKey] = generateRegionPositions(region.events || [], baseY, regionHeight);
        currentY += regionHeight;
      });
    });
    setNodePositions(initialPositions);
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  const TimelineEvent = ({ x, y, event, baseY }) => {
    const [isHovered, setIsHovered] = useState(false);
    const textOffsetY = y > baseY ? 20 : -20;
    const isSpecialType = event.type === 'leader' || event.type === 'king';

    return (
      <Group
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSpecialType ? (
          <>
            <Text
              x={x}
              y={y}
              text={nodeType[event.type] || '⭕️'}
              fontSize={18}  // 增大特殊类型的图标
              align="center"
              verticalAlign="middle"
              offsetX={9}
              offsetY={9}
            />
            <Text
              x={x}
              y={y - textOffsetY}
              text={event.text}
              fontSize={13}  // 略微增大文字大小
              fontStyle="bold"  // 加粗显示
              align="center"
              verticalAlign="middle"
              offsetX={event.text.length * 3.5}
              fill="#2c3e50"  // 更深的文字颜色
            />
          </>
        ) : (
          <Text
            x={x}
            y={y}
            text={`${nodeType[event.type] || '⭕️'} ${event.text}`}
            fontSize={13}
            align="center"
            verticalAlign="middle"
            offsetX={(event.text.length + 2) * 3.5}
            fill="#2c3e50"
          />
        )}
        {isHovered && (
          <Text
            x={x}
            y={y - (isSpecialType ? textOffsetY * 1.75 : textOffsetY)}
            text={`(${Math.abs(event.year)}BCE)`}
            fontSize={12}
            align="center"
            verticalAlign="middle"
            offsetX={30}
            fill="#666"
            fontStyle="italic"
          />
        )}
      </Group>
    );
  };

  // 添加获取不重复颜色的函数
  const getUniqueColor = (prevColor) => {
    const availableColors = REGION_COLORS.filter(color => color !== prevColor);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  // 修改获取颜色的函数
  const getRegionColor = (segmentIndex, regionIndex) => {
    const key = `${segmentIndex}-${regionIndex}`;
    if (!regionColors[key]) {
      const prevKey = `${segmentIndex}-${regionIndex - 1}`;
      const prevColor = regionColors[prevKey];
      const newColor = getUniqueColor(prevColor);
      setRegionColors(prev => ({
        ...prev,
        [key]: newColor
      }));
      return newColor;
    }
    return regionColors[key];
  };

  // Modify getNodePosition to use "||" as separator instead of "-"
  const getNodePosition = (eventId, baseY) => {
    // eventId format: "事件文本||年份||segmentIndex||regionIndex"
    const parts = eventId.split('||');
    const regionIndex = parts.pop();  // Last part is regionIndex
    const segmentIndex = parts.pop(); // Second to last is segmentIndex
    const eventText = parts[0]; // First part is event text
    
    const regionKey = `${segmentIndex}-${regionIndex}`;
    const position = nodePositions[regionKey]?.[eventText];
    
    if (position === undefined) {
      console.warn(`Position not found for event: ${eventText} in region ${regionKey}`);
      return baseY;
    }
    
    return position;
  };

  // Add click handler for legend items
  const handleLegendClick = (key) => {
    setVisibleTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full  bg-gray-50 min-h-screen p-4">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">中国历史长河</h1>
        <div className="bg-white">
          <Stage
            width={stageWidth-50}
            height={stageHeight-600}
            onWheel={handleWheel}
            draggable
            scale={{ x: scale, y: scale }}
            x={position.x}
            y={position.y}
          >
            <Layer>
              {data.map((segment, segmentIndex) => {
                let currentX = segmentWidths.slice(0, segmentIndex).reduce((sum, width) => sum + width, 0);
                let currentY = 0;
                const regionHeight = getRegionHeight(segment);
                
                return segment.regions.map((region, regionIndex) => {
                  // Use calculated regionHeight instead of region.height
                  const currentColor = getRegionColor(segmentIndex, regionIndex);

                  const regionGroup = (
                    <Group key={`${segmentIndex}-${regionIndex}`}>
                      <Rect
                        x={currentX}
                        y={currentY}
                        width={segmentWidths[segmentIndex]}
                        height={regionHeight}
                        fill={currentColor}
                      />

                      {/* 时间线 */}
                      <Line
                        points={[
                          currentX, currentY + regionHeight/2,
                          currentX + segmentWidths[segmentIndex], currentY + regionHeight/2
                        ]}
                        stroke="black"
                        dash={[5, 5]}
                      />

                      {/* 区域标签 */}
                      <Text
                        x={currentX}
                        y={currentY + regionHeight/2}
                        text={region.label}
                        fontSize={60}
                        fill="rgba(0, 0, 0, 0.1)"
                        width={segmentWidths[segmentIndex]}
                        align="center"
                        verticalAlign="middle"
                        offsetY={18}
                        listening={false}
                      />

                      {/* 事件 */}
                      {(region.events || []).reduce((acc, event) => {
                        if (!visibleTypes[event.type]) {
                          return acc;
                        }

                        const yearPosition = (event.year - segment.startYear) / 
                          (segment.endYear - segment.startYear);
                        const x = currentX + yearPosition * segmentWidths[segmentIndex];
                        const baseY = currentY + regionHeight/2;
                        
                        const eventId = `${event.text}||${event.year}||${segmentIndex}||${regionIndex}`;
                        const eventY = event.type === 'leader' || event.type === 'king'
                          ? baseY
                          : getNodePosition(eventId, baseY);

                        acc.events.push(
                          <TimelineEvent
                            key={eventId}
                            x={x}
                            y={eventY}
                            event={{...event, year: event.year}}
                            baseY={baseY}
                            regionHeight={regionHeight}
                          />
                        );

                        return acc;
                      }, { events: [] }).events}
                    </Group>
                  );

                  currentY += regionHeight;
                  return regionGroup;
                });
              })}
            </Layer>
          </Stage>
        </div>
        
        {/* Moved legend to bottom */}
        <div className="mt-6">
          <button 
            onClick={() => setIsLegendVisible(!isLegendVisible)}
            className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            {isLegendVisible ? '收起图例' : '展开图例'}
          </button>
          {isLegendVisible && (
            <div className="legend grid grid-cols-3 gap-2 p-4 text-sm bg-white rounded-lg shadow-sm">
              {Object.entries(nodeType).map(([key, symbol]) => (
                <div 
                  key={key} 
                  className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded ${
                    !visibleTypes[key] ? 'opacity-30' : ''
                  } transition-all`}
                  onClick={() => handleLegendClick(key)}
                >
                  <span className="w-10 text-center text-lg">{symbol}</span>
                  <span className="text-gray-700 text-sm">{key === 'leader' && '部落首领、公、侯、部落大汗、起义军首领' ||
                         key === 'king' && '国王、皇帝' ||
                         key === 'literati' && '文学家、诗人、词人、小说家、著名学者、戏剧作家、翻译家' ||
                         key === 'scientist' && '科技类名人' ||
                         key === 'politician' && '政治家、著名宰臣、名相、名臣、重臣' ||
                         key === 'historian' && '史学家' ||
                         key === 'philosopher' && '思想家、哲学家' ||
                         key === 'revolutionary' && '改革家、革命家' ||
                         key === 'military' && '军事家、战略家' ||
                         key === 'general' && '军事将领、统帅及著名战役' ||
                         key === 'monk' && '经师、佛教或道教理论家、经学家' ||
                         key === 'artist' && '书法家、画家、音乐家' ||
                         key === 'capital' && '国都' ||
                         key === 'event' && '重要历史事件' ||
                         key === 'longEvent' && '持续1年以上的事件' ||
                         key === 'development' && '某事物发展' ||
                         key === 'majorDev' && '重大发展' ||
                         key === 'ethnic' && '民族出现' ||
                         key === 'ethnicDev' && '民族发展' ||
                         key === 'educator' && '教育家、外交家、社会学家' ||
                         key === 'other' && '其他历史名人'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineCanvas;