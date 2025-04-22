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
    <div className="fixed w-[50%] sm:w-[70%] bottom-4 right-4 lg:right-auto lg:translate-x-[36%] lg:w-[65%] z-50 w-[400px]">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20">
          <RangeSelector
            dataSource={data}
            onValueChanged={handleValueChanged}
            value={value}
            containerBackgroundColor="#2D2D2D"
            size={{ height: 125 }}
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
              <Series type="bar" argumentField="arg" valueField="val" />
            </Chart>
          </RangeSelector>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
