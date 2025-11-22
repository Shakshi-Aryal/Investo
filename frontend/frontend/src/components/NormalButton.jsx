import React from "react";

const NormalButton = ({ 
  text,
  btype, 
  onClick, 
  bgColor, 
  textColor, 
  hoverBg, 
  hoverText, 
  hoverBorder,
  bColor //Border Color
}) => {
  return (
    <button
      type={btype}
      onClick={onClick}
      className={`w-full font-semibold px-6 py-2 rounded-lg transition border cursor-pointer`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: bColor,
        borderWidth: "1px",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = hoverBg;
        e.target.style.color = hoverText;
        e.target.style.borderColor=hoverBorder;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = bgColor;
        e.target.style.color = textColor;
        e.target.style.borderColor=bColor;
      }}
    >
      {text}
    </button>
  );
};

export default NormalButton;
