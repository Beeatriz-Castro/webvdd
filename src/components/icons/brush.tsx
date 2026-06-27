import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"svg">;

const BrushIcon = (props: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <g clipPath="url(#clip0_brush)">
      <path
        d="M7.31335 1.33301H5.98002C2.64669 1.33301 1.31335 2.66634 1.31335 5.99967V9.99967C1.31335 13.333 2.64669 14.6663 5.98002 14.6663H9.98002C13.3134 14.6663 14.6467 13.333 14.6467 9.99967V8.66634"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5867 2.37315C13.7667 4.41982 11.7067 7.20649 9.98667 8.58649L8.93333 9.42649C8.8 9.52649 8.66667 9.60649 8.51334 9.66649C8.51334 9.56649 8.50667 9.46649 8.49333 9.35982C8.43333 8.91315 8.23334 8.49315 7.87334 8.13982C7.50667 7.77315 7.06667 7.56649 6.61334 7.50649C6.50667 7.49982 6.4 7.49315 6.29333 7.49982C6.35333 7.33315 6.44 7.17982 6.55334 7.05315L7.39334 5.99982C8.77334 4.27982 11.5667 2.20649 13.6067 1.38649C13.92 1.26649 14.2267 1.35982 14.42 1.55315C14.62 1.75315 14.7133 2.05982 14.5867 2.37315Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.51998 9.65966C8.51998 10.2463 8.29331 10.8063 7.87331 11.233C7.54665 11.5597 7.10665 11.7863 6.57998 11.853L5.26665 11.993C4.55331 12.073 3.93998 11.4663 4.01998 10.7397L4.15998 9.42633C4.28665 8.25966 5.25998 7.513 6.29998 7.493C6.40665 7.48633 6.51331 7.493 6.61998 7.49966C7.07331 7.55966 7.51331 7.76633 7.87998 8.133C8.23998 8.493 8.43998 8.90633 8.49998 9.353C8.51331 9.45966 8.51998 9.56633 8.51998 9.65966Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5467 7.98663C10.5467 6.59329 9.42002 5.45996 8.02002 5.45996"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_brush">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default BrushIcon;
