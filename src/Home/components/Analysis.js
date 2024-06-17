import "../index.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchStockList } from "../../store/modules/stock";
import { useEffect } from "react";
import { StrategyAnalysis } from "./StrategyAnalysis";

function Analysis() {
  const { stockList } = useSelector((state) => state.stock);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchStockList());
  }, [dispatch]);
  // console.log(stockList)
  const { dates, values } = splitData(stockList);
  function splitData(rawData) {
    let dates = [];
    let values = [];
    for (let i = 0; i < rawData.length; i++) {
      dates.push(rawData[i]["date"]);
      let v = [];
      v.push(rawData[i]["open"]);
      v.push(rawData[i]["close"]);
      v.push(rawData[i]["low"]);
      v.push(rawData[i]["high"]);
      values.push(v);
    }
    return {
      dates: dates,
      values: values,
    };
  }

  return (
    <div>
      <div className="mainchart">
        <StrategyAnalysis dates={dates} data={values} />
      </div>
    </div>
  );
}

export {Analysis};
