import { FC, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { useWindowSize } from "./hooks/general"

export const Aero: FC = () => {
  const mouseY = useRef(0)
  const offsetY = useRef(0)
  const [shadePos, setShadePos] = useState(0)

  const [documentWidth, documentHeight] = useWindowSize()
  const portrait = documentWidth < documentHeight * 0.75
  const pixelRatio = window.devicePixelRatio

  const windowWidth = portrait ? documentWidth * 0.9 : documentHeight * 0.8 * 0.8
  const windowHeight = windowWidth * 1.3
  const windowRadius = windowWidth * 0.4
  const windowWidthPixel = windowWidth * pixelRatio
  const windowHeightPixel = windowHeight * pixelRatio
  const windowRadiusPixel = windowRadius * pixelRatio
  const documentWidthPixel = documentWidth * pixelRatio
  const documentHeightPixel = documentHeight * pixelRatio
  const minShadeSize = windowHeight / 13

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const dragMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    mouseY.current = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  const updateShadePos = () => {
    setShadePos((prev) => {
      if (prev - offsetY.current < 0) {
        return 0
      } else if (prev - offsetY.current > windowHeight - minShadeSize + 1) {
        return windowHeight - minShadeSize + 1
      }
      return prev - offsetY.current
    })
  }

  const elementDrag = (e: MouseEvent) => {
    e.preventDefault()
    offsetY.current = mouseY.current - e.clientY
    mouseY.current = e.clientY
    updateShadePos()
  }

  const closeDragElement = () => {
    document.onmouseup = null
    document.onmousemove = null
  }

  const updateLightProjection = () => {
    const canvas = bgCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const width = Math.round(devicePixelRatio * rect.right) - Math.round(devicePixelRatio * rect.left)
      const height = Math.round(devicePixelRatio * rect.bottom) - Math.round(devicePixelRatio * rect.top)
      canvas.width = width
      canvas.height = height

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.lineTo(width, height)

      //TODO
      ctx.lineTo(
        width / 2 +
          windowWidthPixel / 2 -
          windowRadiusPixel +
          windowRadiusPixel * Math.cos(315) -
          (height - (height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315))),
        height
      )

      ctx.lineTo(
        width / 2 + windowWidthPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.cos(315),
        height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315)
      )
      ctx.lineTo(
        width / 2 - windowWidthPixel / 2 + windowRadiusPixel - windowRadiusPixel * Math.cos(315),
        height / 2 - windowHeightPixel / 2 + windowRadiusPixel - windowRadiusPixel * Math.sin(315) + shadePos * 2
      )

      ctx.lineTo(
        width / 2 -
          windowWidthPixel / 2 +
          windowRadiusPixel -
          windowRadiusPixel * Math.cos(315) -
          (height - (height / 2 - windowHeightPixel / 2 + windowRadiusPixel - windowRadiusPixel * Math.sin(315))),
        height + shadePos * 2
      )

      ctx.lineTo(0, height)

      ctx.closePath()
      ctx.fillStyle = "rgb(235, 232, 223)"
      ctx.fill()

      const getLeftX = () => {
        const h1 = width / 2 - windowWidthPixel / 2 + windowRadiusPixel
        const k1 = height / 2 - windowHeightPixel / 2 + windowRadiusPixel
        const h2 = width / 2 - windowWidthPixel / 2 + windowRadiusPixel
        const k2 = height / 2 + windowHeightPixel / 2 - windowRadiusPixel
        const y = documentHeightPixel / 2 - windowHeightPixel / 2 + (shadePos + minShadeSize) * devicePixelRatio
        let x
        if (y < k1) {
          x = h1 - Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(k1 - y, 2))
        } else if (y < k2) {
          x = documentWidthPixel / 2 - windowWidthPixel / 2
        } else {
          x = h2 - Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(y - k2, 2))
        }
        return { x, y }
      }

      const getRightX = () => {
        const h = width / 2 + windowWidthPixel / 2 - windowRadiusPixel
        const k = height / 2 + windowHeightPixel / 2 - windowRadiusPixel
        const y = documentHeightPixel / 2 - windowHeightPixel / 2 + (shadePos + minShadeSize) * devicePixelRatio
        const cornerY = height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315)
        if (y < cornerY) {
          return {
            x: width / 2 + windowWidthPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.cos(315),
            y: height / 2 + windowHeightPixel / 2 - windowRadiusPixel + windowRadiusPixel * Math.sin(315),
          }
        } else {
          return { x: h + Math.sqrt(Math.pow(windowRadiusPixel, 2) - Math.pow(k - y, 2)), y }
        }
      }

      ctx.beginPath()
      const { x, y } = getLeftX()
      ctx.rect(x - 5, y - 5, 10, 10)
      ctx.fillStyle = "blue"
      ctx.fill()

      ctx.beginPath()
      const { x: x2, y: y2 } = getRightX()
      ctx.rect(x2 - 5, y2 - 5, 10, 10)
      ctx.fillStyle = "green"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(
        width / 2 + windowWidthPixel / 2 - windowRadiusPixel,
        height / 2 + windowHeightPixel / 2 - windowRadiusPixel,
        windowRadius * 2,
        0,
        2 * Math.PI
      )
      ctx.stroke()
    }
  }

  updateLightProjection()

  useEffect(() => {
    updateLightProjection()
  }, [])

  return (
    <Wrapper>
      {/* <BrightBackground /> */}
      <BackgroundColour />
      <BackgroundCanvas ref={bgCanvasRef} />

      <Window $width={windowWidth} $height={windowHeight} $radius={windowRadius}>
        <Shade $offset={minShadeSize + shadePos} onMouseDown={(e) => dragMouseDown(e)}>
          <ShadePull />
        </Shade>
        {/* <BrightBackground /> */}
        <Background />
      </Window>
    </Wrapper>
  )
}

const Window = styled.div<{ $width: number; $height: number; $radius: number }>`
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
  border-radius: ${({ $radius }) => $radius}px;
  position: absolute;
  background-color: white;
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  opacity: 0.5;
`

const BackgroundCanvas = styled.canvas`
  height: 100vh;
  width: 100vw;
  position: fixed;
`

const TextBox = styled.div<{ $top?: string; $bottom?: string; $left?: string; $right?: string; $margin: string }>`
  position: absolute;
  ${({ $top }) => $top && `top: ${$top}px;`}
  ${({ $bottom }) => $bottom && `bottom: ${$bottom}px;`}
  ${({ $left }) => $left && `left: ${$left}px;`}
  ${({ $right }) => $right && `right: ${$right}px;`}
  ${({ $margin }) => $margin && `margin: ${$margin};`}
`

const BrightBackground = styled.div`
  background-image: url("hdr.avif");
  background-size: 20000px;
  height: 100%;
  width: 100%;
  position: absolute;
`

const Text = styled.p<{ $size: number }>`
  font-family: "Lora", serif;
  font-size: ${({ $size }) => $size}px;
  color: grey;
  /* display: none; */
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
`

const BackgroundColour = styled.div`
  width: 100%;
  height: 100%;
  /* background: linear-gradient(20deg, rgba(235, 232, 223, 1) 10%, rgba(235, 232, 223, 0) 100%); */
  background-color: rgb(255, 0, 0);
  /* background-size: 65% 100%; */
  /* mix-blend-mode: multiply; */
  position: fixed;
`

const Shade = styled.div<{ $offset: number }>`
  background-color: #d7d7d7;
  width: 100%;
  position: absolute;
  cursor: grab;
  height: ${({ $offset }) => $offset}px;
  z-index: 1;
  margin-top: -1px;

  &:active {
    cursor: grabbing;
  }
`

const ShadePull = styled.div`
  height: 4px;
  width: 30%;
  position: absolute;
  left: 35%;
  bottom: 24px;
  background-color: #c1c1c1;
  border-radius: 2px;
`

const Background = styled.div`
  height: 110%;
  width: 110%;
  margin-left: -5%;
  margin-top: -5%;
  background: linear-gradient(to top, #040308, #ad4a28, #dd723c, #fc7001, #dcb697, #9ba5ae, #3e5879, #020b1a);
  position: absolute;
  mix-blend-mode: multiply;
  filter: blur(10px);
`
