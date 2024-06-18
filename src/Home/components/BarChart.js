import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Col, InputNumber, Row, Slider, Space } from "antd";

const BarChart = ({ style = { width: "800px", height: "600px" } }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    const myChart = echarts.init(chartRef.current);
    const rawData = [
      [100, 302, 301, 334, 390, 330, 320],
      [320, 132, 101, 134, 90, 230, 210],
      [220, 182, 191, 234, 290, 330, 310],
      [150, 212, 201, 154, 190, 330, 410],
      [820, 832, 901, 934, 1290, 1330, 1320],
    ];
    const totalData = [];
    for (let i = 0; i < rawData[0].length; ++i) {
      let sum = 0;
      for (let j = 0; j < rawData.length; ++j) {
        sum += rawData[j][i];
      }
      totalData.push(sum);
    }
    const grid = {
      left: 100,
      right: 100,
      top: 50,
      bottom: 50,
    };
    const gridWidth = myChart.getWidth() - grid.left - grid.right;
    const gridHeight = myChart.getHeight() - grid.top - grid.bottom;
    const categoryWidth = gridWidth / rawData[0].length;
    const barWidth = categoryWidth * 0.6;
    const barPadding = (categoryWidth - barWidth) / 2;
    const series = [
      "Direct",
      "Mail Ad",
      "Affiliate Ad",
      "Video Ad",
      "Search Engine",
    ].map((name, sid) => {
      return {
        name,
        type: "bar",
        stack: "total",
        barWidth: "60%",
        label: {
          show: true,
          formatter: (params) => Math.round(params.value * 1000) / 10 + "%",
        },
        data: rawData[sid].map((d, did) =>
          totalData[did] <= 0 ? 0 : d / totalData[did]
        ),
      };
    });
    const color = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"];
    const elements = [];
    for (let j = 1, jlen = rawData[0].length; j < jlen; ++j) {
      const leftX = grid.left + categoryWidth * j - barPadding;
      const rightX = leftX + barPadding * 2;
      let leftY = grid.top + gridHeight;
      let rightY = leftY;
      for (let i = 0, len = series.length; i < len; ++i) {
        const points = [];
        const leftBarHeight =
          (rawData[i][j - 1] / totalData[j - 1]) * gridHeight;
        points.push([leftX, leftY]);
        points.push([leftX, leftY - leftBarHeight]);
        const rightBarHeight = (rawData[i][j] / totalData[j]) * gridHeight;
        points.push([rightX, rightY - rightBarHeight]);
        points.push([rightX, rightY]);
        points.push([leftX, leftY]);
        leftY -= leftBarHeight;
        rightY -= rightBarHeight;
        elements.push({
          type: "polygon",
          shape: {
            points,
          },
          style: {
            fill: color[i],
            opacity: 0.25,
          },
        });
      }
    }
    const option = {
      legend: {
        selectedMode: false,
      },
      grid,
      yAxis: {
        type: "value",
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      series,
      graphic: {
        elements,
      },
    };
    myChart.setOption(option);
  }, []);
  const DecimalStep = () => {
    const [inputValue, setInputValue] = useState(0);
    const onChange = (value) => {
      if (isNaN(value)) {
        return;
      }
      setInputValue(value);
    };
    return (
      <Row>
        <Col span={12}>
          <Slider
            min={0}
            max={1}
            onChange={onChange}
            value={typeof inputValue === "number" ? inputValue : 0}
            step={0.01}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={1}
            style={{
              margin: "0 16px",
            }}
            step={0.01}
            value={inputValue}
            onChange={onChange}
          />
        </Col>
      </Row>
    );
  };
  return (
    <div>
      <div ref={chartRef} style={style}></div>
      <Space
        style={{
          width: "100%",
          paddingLeft: "20%"
        }}
        direction="vertical"
      >
        <DecimalStep />
        <DecimalStep />
        <DecimalStep />
        <DecimalStep />
        <DecimalStep />
        <DecimalStep />
        <DecimalStep />
      </Space>
    </div>
  );
};

export { BarChart };
