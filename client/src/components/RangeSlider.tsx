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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[80%]">
      <div className="rounded-lg shadow-2xl">
        <div className="bg-white backdrop-blur-sm rounded-lg py-2">
          <RangeSelector
            dataSource={data}
            onValueChanged={handleValueChanged}
            value={value}
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
                color="#1976d2"
              />
            </Chart>
          </RangeSelector>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
