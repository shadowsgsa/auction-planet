import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SellItem.css';

const SellItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    quantity: 1,
    description: '',
    saleType: 'buy-now',
    price: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      console.log('FORM DATA BEFORE SUBMIT:', formData);
  console.log('Images array before sending:', images);

    if (formData.saleType === 'buy-now') {
      // Create product for Buy Now
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const formDataToSend = new FormData();

        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('condition', formData.condition);
        formDataToSend.append('quantity', formData.quantity);

        images.forEach((image) => {
          formDataToSend.append('images', image);
        });

        if (images.length === 0) {
          alert('Please select at least one image.');
          setLoading(false);
          return;
        }


        await axios.post(`${API_URL}/products`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        alert('Product listed successfully!');
        navigate('/my-account');
      } catch (error) {
        console.error('Error creating product:', error);
        alert(error.response?.data?.message || 'Failed to create product');
      } finally {
        setLoading(false);
      }
    } else {
      // Redirect to create auction page
      navigate('/create-auction');
    }
  };

  return (
    <div className="sell-item-page">
      <div className="sell-item-container">
        <h1>List Your Item</h1>
        <p className="page-subtitle">Add your item to our marketplace</p>

        <form onSubmit={handleSubmit} className="sell-item-form">
          {/* Item Photos */}
          <div className="form-section">
            <h2>Item Photos</h2>
            <div className="upload-area">
              <div className="upload-icon">☁️</div>
              <p>Drop files here or click to upload</p>
              <p className="upload-note">Supported formats: JPG, PNG (Max 5 images)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="file-input"
                onChange={handleImageChange}
              />
              {images.length > 0 && (
                <p className="upload-note">{images.length} file(s) selected</p>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="form-section">
            <h2>Item Details</h2>
            
            <div className="form-group">
              <label htmlFor="title">Item Name *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Vintage Watch Collection"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="art">Art</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h2>Description</h2>
            <div className="form-group">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your item in detail..."
                rows="6"
                required
              />
              <p className="char-count">{formData.description.length} / 1000 characters</p>
            </div>
          </div>

          {/* Sale Type & Pricing */}
          <div className="form-section">
            <h2>Sale Type & Pricing</h2>
            
            <div className="form-group">
              <label>Sale Type *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="saleType"
                    value="auction"
                    checked={formData.saleType === 'auction'}
                    onChange={handleChange}
                  />
                  <span>Auction</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="saleType"
                    value="buy-now"
                    checked={formData.saleType === 'buy-now'}
                    onChange={handleChange}
                  />
                  <span>Buy It Now</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="price">
                {formData.saleType === 'auction' ? 'Starting Bid' : 'Price'} *
              </label>
              <div className="price-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button className='btn btn-primary bg-transparent border border-gray text-dark cancel-hover' type="button" id="" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : formData.saleType === 'buy-now' ? 'List Product' : 'Continue to Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
