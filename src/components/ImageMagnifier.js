import { useState } from 'react';

const ImageMagnifier = ({ url }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    const handleMouseHover = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setPosition({ x, y });
        setCursorPosition({ x: e.pageX - left, y: e.pageY - top })
    }

    return (
        <div
            className='magnifier-img-container'
            onMouseEnter={() => {
                setShow(true)
            }}
            onMouseLeave={() => {
                setShow(false)
            }}
            onMouseMove={handleMouseHover}
        >
            <img className='magnifier-img' src={url} alt="" />
            {show &&
                <div
                    style={{
                        position: 'absolute',
                        left: `${cursorPosition.x - 80}px`,
                        top: `${cursorPosition.y - 80}px`,
                        pointerEvents: 'none'
                    }}
                >
                    <div
                        className='magnifier-image'
                        style={{
                            backgroundImage: `url(${url})`,
                            backgroundPosition: `${position.x}% ${position.y}% `
                        }}
                    />
                </div>
            }

        </div>
    )
}

export default ImageMagnifier;