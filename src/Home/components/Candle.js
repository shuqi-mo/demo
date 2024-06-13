import { useRef, useEffect } from "react";
import * as echarts from "echarts";
import "../index.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrushArea, setBrushArea } from "../../store/modules/stock";

const CandleChart = ({
  dates,
  data,
  style = { width: "800px", height: "600px" },
}) => {
  const { brushArea } = useSelector((state) => state.stock);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchBrushArea());
  }, [dispatch]);
  const chartRef = useRef(null);
  function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }
  function calculateBOLLUP(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += +(data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA + 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateBOLLDOWN(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      var MA = sum / dayCount;
      var MD = 0;
      for (var j = 0; j < dayCount; j++) {
        MD += (data[i - j][1] - MA) * (data[i - j][1] - MA);
      }
      result.push((MA - 2 * Math.sqrt(MD / dayCount)).toFixed(2));
    }
    return result;
  }
  function calculateRSI(dayCount, data) {
    var result = [];
    var gain = [];
    var loss = [];
    for (var i = 1, len = data.length; i < len; i++) {
      if (data[i][1] - data[i - 1][1] > 0) {
        gain.push(data[i][1] - data[i - 1][1]);
        loss.push(0);
      } else {
        gain.push(0);
        loss.push(data[i - 1][1] - data[i][1]);
      }
    }
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount + 1) {
        result.push("-");
        continue;
      }
      var sumGain = 0;
      var sumLoss = 0;
      for (var j = 0; j < dayCount; j++) {
        sumGain += +gain[i - j];
        sumLoss += +loss[i - j];
      }
      result.push(((sumGain / (sumGain + sumLoss)) * 100).toFixed(2));
    }
    return result;
  }
  function calculateKDJ(dayCount, data, type) {
    var k = [];
    var d = [];
    var j = [];
    for (var i = 0, len = data.length; i < len; i++) {
      var c = data[i][1];
      if (i < dayCount) {
        k.push(50);
        d.push(50);
        j.push(50);
        continue;
      }
      var l = data[i][2];
      var h = data[i][3];
      for (var r = 1; r < dayCount + 1; r++) {
        if (data[i - r][2] < l) {
          l = data[i - r][2];
        }
        if (data[i - r][3] > h) {
          h = data[i - r][3];
        }
      }
      var rsv = ((c - l) / (h - l)) * 100;
      var currentK = rsv / 3 + (k[i - 1] * 2) / 3;
      k.push(currentK.toFixed(2));
      var currentD = currentK / 3 + (d[i - 1] * 2) / 3;
      d.push(currentD.toFixed(2));
      j.push((3 * currentD - 2 * currentK).toFixed(2));
    }
    if (type === 1) {
      return k;
    } else if (type === 2) {
      return d;
    } else {
      return j;
    }
  }
  useEffect(() => {
    // 1. 生成实例
    const myChart = echarts.init(chartRef.current);
    // 2. 准备图表参数
    const option = {
      title: {
        text: 'Candlestick View',
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        data: [
          "MA30",
          "MA50",
          "MA100",
          "MA200",
          "BOLL_MID",
          "BOLL_UP",
          "BOLL_DOWN",
          "RSI",
          "K",
          "D",
          "J",
        ],
        inactiveColor: "#777",
        bottom: 10,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        textStyle: {
          color: "#000",
        },
        position: function (pos, params, el, elRect, size) {
          const obj = {
            top: 10,
          };
          obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: false,
          },
          brush: {
            type: ["lineX", "clear"],
          },
        },
      },
      axisPointer: {
        link: [
          {
            xAxisIndex: "all",
          },
        ],
        label: {
          backgroundColor: "#777",
        },
      },
      brush: {
        xAxisIndex: "all",
        brushLink: "all",
        outOfBrush: {
          colorAlpha: 0.1,
        },
      },
      xAxis: [
        {
          type: "category",
          data: dates,
          axisLine: { lineStyle: { color: "#8392A5" } },
        },
        {
          type: "category",
          gridIndex: 1,
          data: dates,
          axisLine: { lineStyle: { color: "#8392A5" } },
        },
      ],
      yAxis: [
        {
          scale: true,
          axisLine: { lineStyle: { color: "#8392A5" } },
        },
        {
          scale: true,
          gridIndex: 1,
          axisLine: { lineStyle: { color: "#8392A5" } },
        },
      ],
      grid: [
        {
          left: "10%",
          right: "8%",
          height: "50%",
        },
        {
          left: "10%",
          right: "8%",
          top: "63%",
          height: "16%",
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 92,
          end: 94,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: "slider",
          top: "85%",
          start: 92,
          end: 94,
        },
      ],
      series: [
        {
          type: "candlestick",
          name: "Day",
          data: data,
          itemStyle: {
            color: "#FD1050",
            color0: "#0CF49B",
            borderColor: "#FD1050",
            borderColor0: "#0CF49B",
          },
        },
        {
          name: "MA30",
          type: "line",
          data: calculateMA(30, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA50",
          type: "line",
          data: calculateMA(50, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA100",
          type: "line",
          data: calculateMA(100, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "MA200",
          type: "line",
          data: calculateMA(200, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_MID",
          type: "line",
          data: calculateMA(9, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_UP",
          type: "line",
          data: calculateBOLLUP(9, data),
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: 'rgb(215,225,252)',
            opacity: 0.5
          },
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "BOLL_DOWN",
          type: "line",
          data: calculateBOLLDOWN(9, data),
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: 'white',
            opacity: 1
          },
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "RSI",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: calculateRSI(14, data),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "K",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: calculateKDJ(9, data, 1),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "D",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: calculateKDJ(9, data, 2),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
        {
          name: "J",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: calculateKDJ(9, data, 3),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        },
      ],
    };
    // 监听brush，获取刷选参数
    myChart.on("brushEnd", (params) => {
      var select = params.areas[0].coordRange;
      var start = select[0];
      var end = select[1];
      var area = [];
      area.push(start);
      area.push(end);
      dispatch(setBrushArea(area));
    });
    // 刷选
    myChart.dispatchAction({
      type: "brush",
      areas: [
        {
          brushType: "lineX",
          coordRange: [dates[brushArea[0]], dates[brushArea[1]]],
          // coordRange: ["26/12/2021", "28/12/2021"],
          xAxisIndex: 0,
        },
      ],
    });
    // 3. 渲染参数
    myChart.setOption(option);
  }, [dates, data, dispatch, brushArea, calculateRSI]);
  return <div ref={chartRef} style={style}></div>;
};

export { CandleChart };
