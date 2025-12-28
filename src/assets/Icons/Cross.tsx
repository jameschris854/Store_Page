import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={12}
    height={12}
    viewBox="0 0 511.999 511.999"
    {...props}
  >
    <path fill={props.color} d="M406.261 116.87h-83.478V33.391C322.783 14.978 307.804 0 289.391 0h-66.783c-18.413 0-33.391 14.978-33.391 33.391v83.478h-83.478c-18.413 0-33.391 14.978-33.391 33.391v66.783c0 18.413 14.978 33.391 33.391 33.391h83.478v228.174c0 18.413 14.978 33.391 33.391 33.391h66.783c18.413 0 33.391-14.978 33.391-33.391V250.435h83.478c18.413 0 33.391-14.978 33.391-33.391v-66.783c.001-18.413-14.977-33.391-33.39-33.391z" />
  </svg>
)
export default SvgComponent
