import React, { useState, useEffect, useRef } from 'react';
import IconChevronDown from '../assets/icons/icon-chevron-down.svg';

const CustomDropdown = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(props.defaultOption || undefined);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        props.onSelect(option)
    };

    useEffect(() => {
        setSelectedOption(props.defaultOption)
    }, [props.defaultOption])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative filter-border" ref={dropdownRef} style={{ minWidth: 100, ...props.customStyle }}>
            <div className="flex justify-between p-1 cursor-pointer" onClick={toggleDropdown}>
                <div className='flex'>
                    <img className='pl-1' src={props.customIcon} width={20} alt="Session Icon" />
                    <span
                        className={`${props.dontShowTextIfOptionIs === selectedOption ? 'italic' : '' } font-light text-sm px-2 mt-0.5 select-none truncate`}
                        style={{ color: props.dontShowTextIfOptionIs === selectedOption ?  '#C2C5CD' : 'black', fontFamily: 'sans-serif' }}
                    >
                        { props.dontShowTextIfOptionIs === selectedOption ? props.defaultText : selectedOption }
                    </span>
                </div>

                <img src={IconChevronDown} width={20} className="mt-0.5 pr-1" alt="Dropdown Icon" />
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-2 bg-white shadow-md font-thin" style={{ fontFamily: 'sans-serif', minWidth: '100%' }}>
                    <ul className="list-none p-0 m-0">
                        {props.options.map((option, i) => {
                            return (
                                <li key={i}
                                    className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
                                    style={selectedOption === option ? { color: '#6AA6F6', backgroundColor: '#E6F2FE' } : {}}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option}
                                </li>
                            )
                        })
                        }
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
