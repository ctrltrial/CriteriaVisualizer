import React from "react";
import RangeSelector, {
  Margin,
  Scale,
  Chart,
  Series,
  Label,
} from "devextreme-react/range-selector";

interface RangeSliderProps {
  data: Array<{ arg: number; val: number }>;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  lowerSliderBound: number;
  upperSliderBound: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  data,
  value,
  onValueChange,
  lowerSliderBound,
  upperSliderBound,
}) => {
  const handleValueChanged = (e: any) => {
    onValueChange(e.value);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[65%]">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20">
          <RangeSelector
            dataSource={data}
            onValueChanged={handleValueChanged}
            value={value}
            containerBackgroundColor="#2D2D2D" // Dark background for the range selector
          >
            <Margin top={10} bottom={10} left={30} right={30} />
            <Scale startValue={lowerSliderBound} endValue={upperSliderBound} />
            <Scale
              startValue={lowerSliderBound}
              endValue={upperSliderBound}
              tickInterval={1}
            >
              <Label format="" />
            </Scale>
            <Chart>
              <Series
                type="bar"
                argumentField="arg"
                valueField="val"
                // You can adjust the series color to complement the dark theme.
                // color="#1976d2"
              />
            </Chart>
          </RangeSelector>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
