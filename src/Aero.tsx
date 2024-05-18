import { FC, useEffect, useRef, useState } from "react"
import styled from "styled-components"

export const Aero: FC = () => {
  const mouseY = useRef(0)
  const offsetY = useRef(0)
  const [shadePos, setShadePos] = useState(0)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const dragMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    mouseY.current = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  const updateShadePos = () => {
    setShadePos((prev) => {
      if (prev - offsetY.current < 16) {
        return 16
      } else if (prev - offsetY.current > 755) {
        return 755
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

  useEffect(() => {
    const canvas = bgCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const width = Math.round(devicePixelRatio * rect.right) - Math.round(devicePixelRatio * rect.left)
      const height = Math.round(devicePixelRatio * rect.bottom) - Math.round(devicePixelRatio * rect.top)
      canvas.width = width
      canvas.height = height
      // ctx.beginPath()
      // ctx.moveTo(0, 0)
      // ctx.lineTo(width, 0)
      // ctx.lineTo(width, height)
      // ctx.fillStyle = "yellow"
      // ctx.clip()

      // ctx.beginPath()
      // ctx.rect(0, 0, width, height)
      // ctx.fillStyle = "blue"
      // ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width, 0)
      ctx.lineTo(width, height)
      // ctx.lineTo(0, height)

      ctx.lineTo(1900, height)
      ctx.lineTo(2200, height - 300)
      ctx.lineTo(1291, 265)
      ctx.lineTo(0, height - 300)

      ctx.closePath()
      ctx.fillStyle = "rgb(235, 232, 223)"
      ctx.fill()

      // ctx.globalCompositeOperation = "destination-out"
      // ctx.clip()
    }
  }, [])

  return (
    <Wrapper>
      <BrightBackground />
      <BackgroundColour />
      <BackgroundCanvas ref={bgCanvasRef} />
      <TextBox $top="0" $left="0" $margin="32px">
        <Text $size={16}># BA 1506</Text>
      </TextBox>
      <TextBox $top="0" $right="0" $margin="32px">
        <Text $size={16}>London ◯ New York</Text>
      </TextBox>
      <TextBox $bottom="0" $left="0" $margin="32px">
        <Text $size={16}>Flight time remaining: 2 hours, 34 minutes</Text>
      </TextBox>

      <TextBox $bottom="0" $right="0" $margin="32px">
        <Text $size={16}>◯ About</Text>
      </TextBox>
      <Window>
        <Shade $offset={shadePos} onMouseDown={(e) => dragMouseDown(e)}>
          <ShadePull />
        </Shade>
        <BrightBackground />
        <Background />
      </Window>
    </Wrapper>
  )
}

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
  background: linear-gradient(20deg, rgba(235, 232, 223, 1) 10%, rgba(235, 232, 223, 0) 100%);
  /* background-color: rgb(235, 232, 223); */
  /* background-size: 65% 100%; */
  /* mix-blend-mode: multiply; */
  position: fixed;
`

const Window = styled.div`
  max-height: 85%;
  max-width: 90%;
  aspect-ratio: 3 / 4;
  position: absolute;
  background-color: white;
  border-radius: 250px;
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
`

const Shade = styled.div<{ $offset: number }>`
  background-color: #d7d7d7;
  width: 100%;
  position: absolute;
  cursor: grab;
  height: ${({ $offset }) => 60 + $offset}px;
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
