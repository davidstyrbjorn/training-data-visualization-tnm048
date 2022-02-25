import * as d3 from 'd3';
import React from 'react';
import { useRecoilValue } from 'recoil';
import useD3 from '../../hooks/useD3';
import { filteredPersonData } from '../../states/person-state';

import '../../styles/components/line-plot.scss';
import { lifestyle } from '../../types/types';

// With inspiration from this tutorial: https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
const SpiderPlot: React.FC<{}> = () => {
    // Grab the person data
    const personData = useRecoilValue(filteredPersonData);
    const data = useRecoilValue(filteredPersonData);

    // Set the dimensions and margins of the graph
    let margin = {top: 100, right: 0, bottom: 0, left: 100},
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom,
        strokeWidth = 5;

    // @TODO: Make this public?
    const colors:string[] = ["#fc0b03", "#fc8403", "#fcf803", "#7bfc03", "#007804", "#00fbff", "#004cff", "#4c00ff"];

    // Center of spider plot circles
    let center = {x: width/2, y: height/2};

    const ref = useD3((div: any) =>  {
        if(personData.length === 0) return;
        else {

            // Linear range with values ranging from 0-5
            let domainRange = {min: 0, max: 5};
            let scale = d3.scaleLinear()
                .domain([domainRange.min, domainRange.max])
                .range([0, 250]);

            // Tick values displayed along circle border
            let ticks = [1, 2, 3, 4, 5];
            let spiderPlotSvg = d3.select('#spider_viz')
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'spider-plot-svg')

            // Add circles representing values 1-5
            ticks.forEach(tick => (
                spiderPlotSvg.append("circle")
                    .attr("cx", center.x)
                    .attr("cy", center.y)
                    .attr("fill", "none")
                    .attr("stroke", "azure")
                    .attr("stroke-width", strokeWidth)
                    .attr("r", scale(tick))
            ));

            // Label circles with tick values
            ticks.forEach(tick => (
                spiderPlotSvg.append("text")
                    .attr("fill", "azure")
                    .attr("x", center.x + 3 * strokeWidth)
                    .attr("y", center.y - 2 * strokeWidth - scale(tick))
                    .text(tick.toString())
            ));

            // Converts from polar coordinates to cartesian
            const angleToCoord = (angle: number, value: number): [number, number] => {
                let r = scale(value);
                let x = r * Math.cos(angle);
                let y = r * Math.sin(angle);
                return [center.x + x, center.y - y];
            }

            // Filter data to only include one day 2019-11-06
            let res = data[0].lifestyle.filter(obj => {
                return obj.date === "2019-11-06"
            })

            const attr = Object.keys(data[0].lifestyle[0]); // Getting keys from each entry
            console.log(attr);

            // Temporarily, only use attributes in range 1-5
            const allowedAttribs = ['fatigue', 'mood', 'readiness', 'sleep_quality']
            const attributes:string[] = []; 
            attr.forEach(function (item, index) {
                if (allowedAttribs.includes(item)) {
                    //console.log("CONTAINS " + item);
                    attributes.push(attr[index]);
                }
            });

            // Numbers between 1-5
            //fatigue: number;
            //mood: number;
            //readiness: number;
            //sleep_quality: number;
            //let testLen = 4;

            let length = attributes.length;

            const getPathForData = (d: lifestyle): [number,number][] => {
                // List of coordinate pairs
                const coordinates:[number,number][] = [];
                attributes.forEach(function (item, index) {
                    let angle = (2*Math.PI * index / length) + (Math.PI / 2);
                    //@ts-ignore
                    coordinates.push(angleToCoord(angle, d[item]));
                });
                
                return coordinates;
            }

            attributes.forEach(function (item, index) {
                let angle = (2*Math.PI * index / length) + (Math.PI / 2);

                let [lineCoordX, lineCoordY] = angleToCoord(angle, domainRange.max);
                let [textX, textY] = angleToCoord(angle, domainRange.max + 1);

                let attributeName = item;
                console.log(item);

                // Draw lines from center to edges of spider plot
                spiderPlotSvg.append("line")
                    .attr("x1", center.x)
                    .attr("y1", center.y)
                    .attr("x2", lineCoordX)
                    .attr("y2", lineCoordY)
                    .attr("stroke", "azure")
                    .attr("stroke-width", strokeWidth);

                spiderPlotSvg.append("text")
                    .attr("text-align", "center")
                    .attr("x", textX)
                    .attr("y", textY)
                    .attr("fill", "azure")
                    .text(attributeName);

                spiderPlotSvg.selectAll('spiderPlotNodes')
                    .data(res)
                    .enter()
                    .append('circle')
                        .attr('fill', 'red')
                        .attr('stroke', 'none')
                        //@ts-ignore
                        .attr('cx', (d) => angleToCoord(angle, d[item])[0])
                        //@ts-ignore
                        .attr('cy', (d) => angleToCoord(angle, d[item])[1])
                        .attr('r', 15);

                let line = d3.line()
                    .x(d => d[0])
                    .y(d => d[1]);

                //let coordinates = getPathForData(data[0].lifestyle);
                let currentData = data[0].lifestyle.filter(obj => {
                    return obj.date === "2019-11-06"
                })

                console.log(currentData);

                let coordinates = getPathForData(currentData[0]);
                console.log(coordinates);
                spiderPlotSvg.append("path")
                    .datum(coordinates)
                    .attr("d", line)
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke", "azure")
                    .attr("fill", "azure")



            });
        }

    }, [personData]);

    //.attr('cx', (d) => angleToCoord(angle, d.sleep_quality)[0])

    return(
        <div ref={ref} id={'spider_viz'}></div>
    );
}

export default SpiderPlot;