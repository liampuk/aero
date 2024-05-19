import { FC, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { useWindowSize } from "./hooks/general"

export const Aero: FC = () => {
  const mouseY = useRef(0)
  const offsetY = useRef(0)

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
  const [shadePos, setShadePos] = useState(windowHeight - minShadeSize + 1)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const mouseStart = (e: MouseEvent) => {
    e.preventDefault()
    mouseY.current = e?.clientY
    document.onmouseup = mouseStop
    document.onmousemove = mouseDrag
  }

  const touchStart = (e: TouchEvent) => {
    mouseY.current = e?.touches[0].clientY
    document.ontouchend = mouseStop
    document.ontouchmove = elementTouchDrag
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

  const mouseDrag = (e: MouseEvent) => {
    e.preventDefault()
    offsetY.current = mouseY.current - e.clientY
    mouseY.current = e.clientY
    updateShadePos()
  }

  const elementTouchDrag = (e: TouchEvent) => {
    offsetY.current = mouseY.current - e.touches[0].clientY
    mouseY.current = e.touches[0].clientY
    updateShadePos()
  }

  const mouseStop = () => {
    document.onmouseup = null
    document.onmousemove = null
    document.ontouchend = null
    document.ontouchmove = null
  }

  const updateLightProjection = () => {
    const canvas = bgCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const width = documentWidthPixel
      const height = documentHeightPixel
      canvas.width = width
      canvas.height = height

      if (shadePos === windowHeight - minShadeSize + 1) {
        ctx.rect(0, 0, width, height)
        ctx.fillStyle = "white"
        ctx.fill()
        return
      }

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

      const { x: x1, y: y1 } = getRightX()
      const { x: x2, y: y2 } = getLeftX()

      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)

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
      // ctx.fillStyle = "rgb(240, 236, 228)"
      ctx.fillStyle = "white"
      ctx.fill()
    }
  }

  updateLightProjection()

  useEffect(() => {
    updateLightProjection()

    // Workaround for chrome issue: https://issues.chromium.org/issues/328755781
    document.addEventListener("visibilitychange", function () {
      updateLightProjection()
    })
  }, [])

  return (
    <Wrapper>
      <BrightBackground />
      <BackgroundColour />
      <BackgroundCanvas ref={bgCanvasRef} />

      <Window $width={windowWidth} $height={windowHeight} $radius={windowRadius}>
        <Shade $offset={minShadeSize + shadePos} onMouseDown={(e: any) => mouseStart(e)} onTouchStart={(e: any) => touchStart(e)}>
          <ShadePull $margin={minShadeSize / 3 + 2} />
        </Shade>
        <BrightBackground />
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
  /* opacity: 0.5; */
`

const BackgroundCanvas = styled.canvas`
  height: 100%;
  width: 100%;
  position: fixed;
  /* opacity: 0.5; */
`

const BrightBackground = styled.div`
  background-image: url("hdr.avif");
  background-size: 20000px 20000px;
  height: 100%;
  width: 100%;
  position: absolute;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
`

const BackgroundColour = styled.div`
  width: 100%;
  height: 100%;
  /* background: linear-gradient(20deg, #a59170 0%, #ff8000 100%); */
  background-color: rgba(255, 184, 0, 0.4);
  background-size: 65% 100%;
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

const ShadePull = styled.div<{ $margin: number }>`
  height: 4px;
  width: 30%;
  position: absolute;
  left: 35%;
  bottom: ${({ $margin }) => $margin}px;
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
