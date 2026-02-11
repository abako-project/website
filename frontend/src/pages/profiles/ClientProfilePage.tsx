/**
 * ClientProfilePage - Client profile view and edit
 *
 * Displays a client's profile information with an edit mode toggle.
 * Mirrors the EJS views at backend/views/clients/profile/show.ejs
 * and backend/views/clients/profile/edit.ejs.
 *
 * Fields displayed:
 *   - Name, email, company, department, website, description, location, languages
 *   - Profile image with upload support
 *
 * Uses React Query hooks for data fetching and mutations.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useClientProfile, useUpdateClientProfile, useUploadProfileImage } from '@hooks/useProfile';
import { useLanguages } from '@hooks/useEnums';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Label } from '@components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Spinner } from '@components/ui/Spinner';
import type { ClientUpdateData, LanguagesMap } from '@/types/index';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClientProfilePageProps {
  clientId: string;
  startInEditMode?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClientProfilePage({ clientId, startInEditMode }: ClientProfilePageProps) {
  const [isEditing, setIsEditing] = useState(startInEditMode ?? false);

  const { data, isLoading, isError, error } = useClientProfile(clientId);
  const { data: languagesMap } = useLanguages();
  const updateMutation = useUpdateClientProfile();
  const uploadMutation = useUploadProfileImage();

  // ------- Form state -------
  const [formData, setFormData] = useState<ClientUpdateData>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when entering edit mode or data changes
  useEffect(() => {
    if (data?.client && isEditing) {
      setFormData({
        name: data.client.name || '',
        company: data.client.company || '',
        department: data.client.department || '',
        website: data.client.website || '',
        description: data.client.description || '',
        location: data.client.location || '',
        languages: data.client.languages || [],
      });
    }
  }, [data?.client, isEditing]);

  const handleEnterEdit = useCallback(() => {
    setIsEditing(true);
    setSelectedFile(null);
    setImagePreview(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setSelectedFile(null);
    setImagePreview(null);
  }, []);

  const handleFieldChange = useCallback((field: keyof ClientUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleLanguageToggle = useCallback((code: string) => {
    setFormData((prev) => {
      const current = prev.languages || [];
      const exists = current.includes(code);
      return {
        ...prev,
        languages: exists ? current.filter((c) => c !== code) : [...current, code],
      };
    });
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(async () => {
    // Upload image first if selected
    if (selectedFile) {
      await uploadMutation.mutateAsync({
        profileType: 'client',
        id: clientId,
        file: selectedFile,
      });
    }

    // Update profile data
    await updateMutation.mutateAsync({
      id: clientId,
      data: formData,
    });

    setIsEditing(false);
    setSelectedFile(null);
    setImagePreview(null);
  }, [clientId, formData, selectedFile, updateMutation, uploadMutation]);

  const isSaving = updateMutation.isPending || uploadMutation.isPending;

  // ------- Loading state -------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ------- Error state -------
  if (isError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Failed to load profile
          </h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { client, avatarUrl, languageNames } = data;

  // ------- Edit mode -------
  if (isEditing) {
    return (
      <ClientProfileEdit
        formData={formData}
        clientEmail={client.email}
        avatarUrl={avatarUrl}
        imagePreview={imagePreview}
        languagesMap={languagesMap}
        fileInputRef={fileInputRef}
        isSaving={isSaving}
        saveError={updateMutation.error?.message || uploadMutation.error?.message || null}
        onFieldChange={handleFieldChange}
        onLanguageToggle={handleLanguageToggle}
        onFileChange={handleFileChange}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    );
  }

  // ------- Show mode -------
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <img
          className="w-20 h-20 rounded-full object-cover border-2 border-border bg-muted"
          src={avatarUrl}
          alt={client.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/none.png';
          }}
        />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{client.name}</h2>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {client.company || 'No company'} / {client.department || 'No department'}
            </p>
          </div>
          <Button variant="outline" onClick={handleEnterEdit}>
            <i className="ri-user-line mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Description</h3>
            <p className="text-muted-foreground">{client.description || 'No description'}</p>
          </div>

          {/* Info list */}
          <div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <i className="ri-translate-2 text-base" />
                <span>{languageNames.length > 0 ? languageNames.join(', ') : 'No languages'}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-map-pin-line text-base" />
                <span>{client.location || 'No location'}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-earth-line text-base" />
                <span>{client.website || 'No website'}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-mail-line text-base" />
                <span>{client.email || 'No email'}</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Sub-component
// ---------------------------------------------------------------------------

interface ClientProfileEditProps {
  formData: ClientUpdateData;
  clientEmail: string;
  avatarUrl: string;
  imagePreview: string | null;
  languagesMap: LanguagesMap | undefined;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isSaving: boolean;
  saveError: string | null;
  onFieldChange: (field: keyof ClientUpdateData, value: string) => void;
  onLanguageToggle: (code: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ClientProfileEdit({
  formData,
  clientEmail,
  avatarUrl,
  imagePreview,
  languagesMap,
  fileInputRef,
  isSaving,
  saveError,
  onFieldChange,
  onLanguageToggle,
  onFileChange,
  onSave,
  onCancel,
}: ClientProfileEditProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Client Profile</CardTitle>
        <p className="text-sm text-muted-foreground">Client data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email (read-only) */}
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Email:</span> {clientEmail}
          </p>
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Description"
            required
          />
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company || ''}
            onChange={(e) => onFieldChange('company', e.target.value)}
            placeholder="Company"
            required
          />
        </div>

        {/* Department */}
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department || ''}
            onChange={(e) => onFieldChange('department', e.target.value)}
            placeholder="Department"
            required
          />
        </div>

        {/* Website */}
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website || ''}
            onChange={(e) => onFieldChange('website', e.target.value)}
            placeholder="Website"
            required
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="Location"
            required
          />
        </div>

        {/* Languages multi-select */}
        <div>
          <Label>Languages</Label>
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-input bg-background p-2 space-y-1">
            {languagesMap ? (
              Object.entries(languagesMap).map(([code, name]) => {
                const isSelected = (formData.languages || []).includes(code);
                return (
                  <label
                    key={code}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/15 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onLanguageToggle(code)}
                      className="rounded border-input"
                    />
                    <span>{code} - {name}</span>
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Loading languages...</p>
            )}
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <Label>Profile Photo (Max size 2MB)</Label>
          <div className="mt-2 flex items-center gap-4">
            <img
              className="w-16 h-16 rounded-full object-cover border-2 border-border bg-muted"
              src={imagePreview || avatarUrl}
              alt="Profile preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/none.png';
              }}
            />
            <div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Select file...
              </Button>
              <input
                ref={fileInputRef as React.RefObject<HTMLInputElement>}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="rounded-md bg-red-500/15 border border-red-500/30 p-3">
            <p className="text-sm text-red-400">{saveError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} isLoading={isSaving}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
