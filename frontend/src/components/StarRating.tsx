// StarRating — interactive or display-only star rating (1-5)
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const StarRating = ({
  value,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeMap = { sm: "text-sm", md: "text-xl", lg: "text-2xl" };
  const display = hoverValue || value;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const starVal = i + 1;
        const filled = starVal <= display;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(starVal)}
            onMouseEnter={() => !readonly && setHoverValue(starVal)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`${sizeMap[size]} ${
              readonly ? "cursor-default" : "star-interactive cursor-pointer"
            } ${
              filled ? "text-yellow-400" : "text-gray-600"
            } bg-transparent border-none p-0 leading-none disabled:opacity-100`}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-white font-bold text-sm tabular-nums">
        {value > 0 ? `${value}/5` : ""}
      </span>
    </div>
  );
};

export default StarRating;
