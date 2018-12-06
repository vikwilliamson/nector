import React from 'react'
import classnames from 'classnames';
import propTypes from 'prop-types';

const SelectListGroup = ({
    name,
    
    value,
    
    error,
    info,
    
    onChange,
    options
    
}) => {
    const selectOptions = options.map(option => (
        <option key = {option.label} value = {option.value}>
            {option.label}
        </option>
    ))
    return (
        <div className="form-group">
            <select
                
                className={classnames("form-control form-control-lg" )}
                 
                name={name}
                value = {value} 
                onChange = {onChange}
            >
                {selectOptions}
            </select>
                
                        
        </div>
    )
}

SelectListGroup.propTypes = {
    name: propTypes.string.isRequired,
    
    value: propTypes.string.isRequired,
    info: propTypes.string,
    error: propTypes.string,
    
    onChange: propTypes.func.isRequired, 
    options: propTypes.array.isRequired
    
}



export default SelectListGroup;