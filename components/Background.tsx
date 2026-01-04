
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const backgroundImages = [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1625944230942-785720377c52?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&q=80&w=1964',
    'https://images.unsplash.com/photo-1590987337605-84f3ed4dc29f?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1554118875-724d3c39b784?auto=format&fit=crop&q=80&w=2070',
];

const Background: React.FC = () => {
    const [activeImage, setActiveImage] = useState(0);
    const [imageUrls, setImageUrls] = useState([backgroundImages[0], backgroundImages[1 % backgroundImages.length]]);
    const bgContainer = document.getElementById('app-bg');

    useEffect(() => {
        // Preload all images to prevent flickering on first cycle
        backgroundImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        let currentImageIndex = 0;
        const interval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
            const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;

            // Load the next image into the non-active slot
            setImageUrls(prev => {
                const newUrls = [...prev];
                newUrls[1 - activeImage] = backgroundImages[nextImageIndex];
                return newUrls;
            });

            // Trigger the fade by swapping the active image
            setActiveImage(prev => 1 - prev);
        }, 10000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this runs only once on mount

    if (!bgContainer) {
        return null;
    }

    const imageStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        transition: 'opacity 1.5s ease-in-out',
        zIndex: 1
    };

    return ReactDOM.createPortal(
        <>
            <img src={imageUrls[0]} style={{ ...imageStyle, opacity: activeImage === 0 ? 1 : 0 }} alt="" />
            <img src={imageUrls[1]} style={{ ...imageStyle, opacity: activeImage === 1 ? 1 : 0 }} alt="" />
        </>,
        bgContainer
    );
};

export default Background;
