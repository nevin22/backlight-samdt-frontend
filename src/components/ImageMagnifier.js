import { useState, useEffect } from 'react';

const ImageMagnifier = ({ url }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [imageSrc, setImageSrc] = useState('');

    const handleMouseHover = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const x = (((e.pageX - scrollX) - left) / width) * 100;
        const y = (((e.pageY - scrollY) - top) / height) * 100;
        setPosition({ x, y });
        setCursorPosition({ x: (e.pageX - scrollX) - (left * 0.35) , y: (e.pageY - scrollY) - (top * 0.35) })
    }

    useEffect(() => { // this will allow magnifier image to display properly regardless of the image content-type
        const fetchImage = async () => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                setImageSrc(objectURL);
            } catch (error) {
                console.error('Error fetching the image:', error);
            }
        };

        fetchImage();
    }, [url]);


    return (
        <div
            // className='img-magnifier-container'
            onMouseEnter={() => {
                setShow(true)
            }}
            onMouseLeave={() => {
                setShow(false)
            }}
            onMouseMove={handleMouseHover}
        >
            <img className='magnifier-img' src={url} alt=""  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {show &&
                <div
                    style={{
                        position: 'absolute',
                        left: `${cursorPosition.x}px`,
                        top: `${cursorPosition.y}px`,
                        pointerEvents: 'none'
                    }}
                >
                    <div
                        className='magnifier-image'
                        style={{
                            backgroundImage: `url(${imageSrc})`,
                            backgroundPosition: `${position.x}% ${position.y}% `
                        }}
                    />
                </div>
            }

        </div>
    )
}

export default ImageMagnifier;