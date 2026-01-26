import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Consignment.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Consignment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    // Auction Shop Basic Info
    title: '',
    description: '',

    // Shop Address
    shopAddressLine1: '',
    shopAddressLine2: '',
    shopCity: '',
    shopState: '',
    shopZip: '',
    shopCountry: 'USA',

    // Shipping Contact
    shippingContactName: '',
    shippingContactPhone: '',

    // Shipping Options (prices)
    standardShipping: '',
    expeditedShipping: '',
    overnightShipping: '',

    // Payment & Terms
    paymentTerms: '',
    terms: '',

    // Tax Rates
    stateTaxRate: '',
    cityTaxRate: '',
    countryTaxRate: '',
    miscTaxRate: '',
    transportExciseTaxRate: '',

    // Inspection & Removal Periods
    inspectionStart: '',
    inspectionEnd: '',
    removalStart: '',
    removalEnd: '',

    // Fees & Commission
    listingFee: '',
    commissionRate: '10',
  });

  const steps = [
    { id: 1, label: 'Shop Info' },
    { id: 2, label: 'Shop Photos' },
    { id: 3, label: 'Address & Shipping' },
    { id: 4, label: 'Terms & Fees' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if user is logged in
    if (!user) {
      setError('You must be logged in to create an auction shop');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic info
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);

      // Add shop address as JSON
      const shopAddress = {
        line1: formData.shopAddressLine1,
        line2: formData.shopAddressLine2,
        city: formData.shopCity,
        state: formData.shopState,
        zip: formData.shopZip,
        country: formData.shopCountry
      };
      formDataToSend.append('shopAddress', JSON.stringify(shopAddress));

      // Add shipping contact as JSON
      const shippingContact = {
        name: formData.shippingContactName,
        phone: formData.shippingContactPhone
      };
      formDataToSend.append('shippingContact', JSON.stringify(shippingContact));

      // Add shipping options as JSON
      const shippingOptions = {
        standard: parseFloat(formData.standardShipping) || 0,
        expedited: parseFloat(formData.expeditedShipping) || 0,
        overnight: parseFloat(formData.overnightShipping) || 0
      };
      formDataToSend.append('shippingOptions', JSON.stringify(shippingOptions));

      // Add tax rates as JSON
      const taxRates = {
        state: parseFloat(formData.stateTaxRate) || 0,
        city: parseFloat(formData.cityTaxRate) || 0,
        country: parseFloat(formData.countryTaxRate) || 0,
        misc: parseFloat(formData.miscTaxRate) || 0,
        transportExcise: parseFloat(formData.transportExciseTaxRate) || 0
      };
      formDataToSend.append('taxRates', JSON.stringify(taxRates));

      // Add inspection period as JSON
      if (formData.inspectionStart && formData.inspectionEnd) {
        const inspectionPeriod = {
          start: formData.inspectionStart,
          end: formData.inspectionEnd
        };
        formDataToSend.append('inspectionPeriod', JSON.stringify(inspectionPeriod));
      }

      // Add removal period as JSON
      if (formData.removalStart && formData.removalEnd) {
        const removalPeriod = {
          start: formData.removalStart,
          end: formData.removalEnd
        };
        formDataToSend.append('removalPeriod', JSON.stringify(removalPeriod));
      }

      // Add payment terms and terms
      if (formData.paymentTerms) formDataToSend.append('paymentTerms', formData.paymentTerms);
      if (formData.terms) formDataToSend.append('terms', formData.terms);

      // Add fees
      if (formData.listingFee) formDataToSend.append('listingFee', formData.listingFee);
      formDataToSend.append('commissionRate', formData.commissionRate);

      // Add images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/auction-shops`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Auction shop submitted for review! You will be notified once approved.');
      navigate('/my-account');
    } catch (err) {
      console.error('Error creating auction shop:', err);
      setError(err.response?.data?.message || 'Failed to create auction shop');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('auctionShopDraft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="consignment-page">
      <div className="consignment-container">
        <h1>Create Your Auction Shop</h1>
        <p className="page-subtitle">
          Set up your consignment auction shop - we'll handle everything from appraisal to sale
        </p>

        {/* Step Wizard */}
        <div className="step-wizard">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep === step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="consignment-form">
          <h2>Auction Shop Details</h2>

          {/* Step 1: Shop Info */}
          {currentStep === 1 && (
            <>
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="title">Auction Shop Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Estate Sale Auction, Luxury Watches Auction"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Shop Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your auction shop, what types of items you'll be selling..."
                    rows="6"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Commission & Fees</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="commissionRate">Commission Rate (%) *</label>
                    <input
                      type="number"
                      id="commissionRate"
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleChange}
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                    <small>Platform commission on each sale</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="listingFee">Listing Fee ($)</label>
                    <input
                      type="number"
                      id="listingFee"
                      name="listingFee"
                      value={formData.listingFee}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    <small>One-time fee to list your shop</small>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Shop Photos */}
          {currentStep === 2 && (
            <div className="form-section">
              <h3>Shop Photos</h3>
              <p className="section-description">Upload photos of your shop or featured items (Max 5 images)</p>

              <div className="upload-area">
                <div className="upload-icon">📷</div>
                <p>Upload shop photos</p>
                <p className="upload-note">Click to browse or drag & drop</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="file-input"
                  onChange={handleImageChange}
                />
              </div>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Address & Shipping */}
          {currentStep === 3 && (
            <>
              <div className="form-section">
                <h3>Shop Address</h3>

                <div className="form-group">
                  <label htmlFor="shopAddressLine1">Address Line 1 *</label>
                  <input
                    type="text"
                    id="shopAddressLine1"
                    name="shopAddressLine1"
                    value={formData.shopAddressLine1}
                    onChange={handleChange}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shopAddressLine2">Address Line 2</label>
                  <input
                    type="text"
                    id="shopAddressLine2"
                    name="shopAddressLine2"
                    value={formData.shopAddressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shopCity">City *</label>
                    <input
                      type="text"
                      id="shopCity"
                      name="shopCity"
                      value={formData.shopCity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopState">State *</label>
                    <input
                      type="text"
                      id="shopState"
                      name="shopState"
                      value={formData.shopState}
                      onChange={handleChange}
                      placeholder="e.g., NY"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shopZip">ZIP Code *</label>
                    <input
                      type="text"
                      id="shopZip"
                      name="shopZip"
                      value={formData.shopZip}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopCountry">Country *</label>
                    <input
                      type="text"
                      id="shopCountry"
                      name="shopCountry"
                      value={formData.shopCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Shipping Contact</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingContactName">Contact Name</label>
                    <input
                      type="text"
                      id="shippingContactName"
                      name="shippingContactName"
                      value={formData.shippingContactName}
                      onChange={handleChange}
                      placeholder="Shipping coordinator name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shippingContactPhone">Contact Phone</label>
                    <input
                      type="tel"
                      id="shippingContactPhone"
                      name="shippingContactPhone"
                      value={formData.shippingContactPhone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Shipping Options (Prices in $)</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="standardShipping">Standard Shipping</label>
                    <input
                      type="number"
                      id="standardShipping"
                      name="standardShipping"
                      value={formData.standardShipping}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expeditedShipping">Expedited Shipping</label>
                    <input
                      type="number"
                      id="expeditedShipping"
                      name="expeditedShipping"
                      value={formData.expeditedShipping}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="overnightShipping">Overnight Shipping</label>
                    <input
                      type="number"
                      id="overnightShipping"
                      name="overnightShipping"
                      value={formData.overnightShipping}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Tax Rates (%)</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stateTaxRate">State Tax</label>
                    <input
                      type="number"
                      id="stateTaxRate"
                      name="stateTaxRate"
                      value={formData.stateTaxRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cityTaxRate">City Tax</label>
                    <input
                      type="number"
                      id="cityTaxRate"
                      name="cityTaxRate"
                      value={formData.cityTaxRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="countryTaxRate">Country Tax</label>
                    <input
                      type="number"
                      id="countryTaxRate"
                      name="countryTaxRate"
                      value={formData.countryTaxRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="miscTaxRate">Misc Tax</label>
                    <input
                      type="number"
                      id="miscTaxRate"
                      name="miscTaxRate"
                      value={formData.miscTaxRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="transportExciseTaxRate">Transport Excise Tax</label>
                    <input
                      type="number"
                      id="transportExciseTaxRate"
                      name="transportExciseTaxRate"
                      value={formData.transportExciseTaxRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Terms & Fees */}
          {currentStep === 4 && (
            <>
              <div className="form-section">
                <h3>Inspection Period</h3>
                <p className="section-description">When can buyers inspect items?</p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inspectionStart">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      id="inspectionStart"
                      name="inspectionStart"
                      value={formData.inspectionStart}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inspectionEnd">End Date & Time</label>
                    <input
                      type="datetime-local"
                      id="inspectionEnd"
                      name="inspectionEnd"
                      value={formData.inspectionEnd}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Removal Period</h3>
                <p className="section-description">When must items be picked up?</p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="removalStart">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      id="removalStart"
                      name="removalStart"
                      value={formData.removalStart}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="removalEnd">End Date & Time</label>
                    <input
                      type="datetime-local"
                      id="removalEnd"
                      name="removalEnd"
                      value={formData.removalEnd}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Terms</h3>

                <div className="form-group">
                  <textarea
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder="e.g., Payment due within 48 hours of auction end..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Terms & Conditions</h3>

                <div className="form-group">
                  <textarea
                    id="terms"
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    placeholder="Enter your auction shop terms and conditions..."
                    rows="6"
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-primary" onClick={prevStep}>
                Previous
              </button>
            )}

            <button type="button" className="btn-primary" onClick={handleSaveDraft}>
              Save as Draft
            </button>

            {currentStep < steps.length ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next Step
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Consignment;
