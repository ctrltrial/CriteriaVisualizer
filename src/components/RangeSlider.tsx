import React from "react";
import RangeSelector, {
  Margin,
  Scale,
  Chart,
  Series,
} from "devextreme-react/range-selector";

interface RangeSliderProps {
  data: Array<{ arg: number; val: number }>;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  data,
  value,
  onValueChange,
}) => {
  const handleValueChanged = (e: any) => {
    onValueChange(e.value);
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e0e0e0",
        boxShadow: "0 -8px 8px rgba(0, 0, 0, 0.03)",
      }}
    >
      <RangeSelector
        dataSource={data}
        onValueChanged={handleValueChanged}
        value={value}
      >
        <Margin top={10} bottom={10} left={30} right={30} />
        <Scale startValue={0} endValue={100} />
        <Chart>
          <Series
            type="bar"
            argumentField="arg"
            valueField="val"
            color="#1976d2"
          />
        </Chart>
      </RangeSelector>
    </div>
  );
};

export default RangeSlider;
