import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct

const CompanyProfileForm = () => {
  // State to hold the form data
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 👇 PASTE YOUR FUNCTION HERE 👇
  async function handleProfileSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      // 1. Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not found.");

      // 2. Upload the company logo
      let publicLogoUrl = null;
      if (logoFile) {
        const filePath = `public/${user.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('company_logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('company_logos')
          .getPublicUrl(filePath);
        publicLogoUrl = data.publicUrl;
      }

      // 3. Insert into your 'companies' table
      const { data: companyData, error: companyInsertError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          logo_url: publicLogoUrl,
          domain: companyDomain,
        })
        .select('id')
        .single();

      if (companyInsertError) throw companyInsertError;

      // 4. Update the user's profile
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: contactName,
          company_id: companyData.id,
        })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      alert('Company profile created successfully!');
      
    } catch (error) {
      console.error('Error creating company profile:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // This is the JSX for your form
  return (
    <form onSubmit={handleProfileSubmit}>
      <h2>Create Company Profile</h2>
      
      <div>
        <label htmlFor="contactName">Contact Name</label>
        <input
          id="contactName"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="companyName">Company Name</label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="companyDomain">Company Domain</label>
        <input
          id="companyDomain"
          type="text"
          value={companyDomain}
          onChange={(e) => setCompanyDomain(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="logo">Company Logo</label>
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files[0])}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default CompanyProfileForm;