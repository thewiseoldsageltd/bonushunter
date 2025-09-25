import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "./ObjectUploader";
import { Upload } from "lucide-react";

interface OperatorFormProps {
  operator?: any;
  onSuccess: () => void;
}

export const OperatorForm: React.FC<OperatorFormProps> = ({ operator, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: operator?.name || '',
    siteUrl: operator?.siteUrl || '',
    description: operator?.description || '',
    logo: operator?.logo || '',
    trustScore: operator?.trustScore?.toString() || '8',
    overallRating: operator?.overallRating?.toString() || '4.5',
    foundedYear: operator?.foundedYear?.toString() || '',
    headquarters: operator?.headquarters || '',
    paymentMethods: operator?.paymentMethods?.join(', ') || '',
    withdrawalMethods: operator?.withdrawalMethods?.join(', ') || '',
    minDeposit: operator?.minDeposit?.toString() || '',
    maxWithdrawal: operator?.maxWithdrawal?.toString() || '',
    withdrawalTimeframe: operator?.withdrawalTimeframe || '',
    liveChat: operator?.liveChat ?? false,
    mobileApp: operator?.mobileApp ?? false,
    casinoGames: operator?.casinoGames ?? false,
    liveCasino: operator?.liveCasino ?? false,
    esports: operator?.esports ?? false,
    virtuals: operator?.virtuals ?? false,
    bonusRating: operator?.bonusRating?.toString() || '4.0',
    oddsRating: operator?.oddsRating?.toString() || '4.0',
    uiRating: operator?.uiRating?.toString() || '4.0',
    active: operator?.active ?? true
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = operator ? `/api/admin/operators/${operator.id}` : '/api/admin/operators';
      const method = operator ? 'PUT' : 'POST';
      
      // Process arrays and convert numeric fields
      const processedData = {
        ...data,
        paymentMethods: data.paymentMethods.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        withdrawalMethods: data.withdrawalMethods.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        // Convert only foundedYear to integer, keep decimal fields as strings for database
        foundedYear: data.foundedYear && data.foundedYear.trim() ? parseInt(data.foundedYear) : undefined,
        // Keep these as strings since the database expects decimal strings
        trustScore: data.trustScore && data.trustScore.trim() ? data.trustScore : undefined,
        overallRating: data.overallRating && data.overallRating.trim() ? data.overallRating : undefined,
        bonusRating: data.bonusRating && data.bonusRating.trim() ? data.bonusRating : undefined,
        oddsRating: data.oddsRating && data.oddsRating.trim() ? data.oddsRating : undefined,
        uiRating: data.uiRating && data.uiRating.trim() ? data.uiRating : undefined,
        minDeposit: data.minDeposit && data.minDeposit.trim() ? data.minDeposit : undefined,
        maxWithdrawal: data.maxWithdrawal && data.maxWithdrawal.trim() ? data.maxWithdrawal : undefined,
      };

      // Only include logo if it's a valid path (starts with /public-objects/) or valid URL
      // This prevents manually entered filenames from overwriting uploaded logos
      if (data.logo && data.logo.trim()) {
        const logoValue = data.logo.trim();
        if (logoValue.startsWith('/public-objects/') || logoValue.startsWith('http://') || logoValue.startsWith('https://')) {
          processedData.logo = logoValue;
        }
        // If logo is just a filename (like "bet365-logo.png"), don't include it to avoid overwriting uploaded logos
      }
      
      // Debug: log the processed data
      console.log('Sending operator data:', processedData);
      
      const response = await apiRequest(method, url, processedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: operator ? "Operator Updated!" : "Operator Added!",
        description: `The operator has been ${operator ? 'updated' : 'added'} successfully.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${operator ? 'update' : 'add'} operator`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.siteUrl) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in operator name and site URL.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formData);
  };

  // Simplified space bar protection - disable when Uppy is active
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Completely block space bar from doing anything except in input fields
      if (e.key === ' ') {
        const target = e.target as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;
        
        // Allow normal space behavior in input fields and textareas
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
            activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        
        // Check if Uppy is active (files selected)
        const isUppyActive = document.body.hasAttribute('data-uppy-active');
        if (isUppyActive) {
          return; // Let Uppy handle its own events
        }
        
        // Block space bar everywhere else
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    document.addEventListener('keypress', handleGlobalKeyDown, true); 
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('keypress', handleGlobalKeyDown, true);
    };
  }, []);

  // Prevent space bar from triggering upload when typing in form fields
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      const target = e.target as HTMLElement;
      // Allow space bar in input fields and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        e.stopPropagation();
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Basic Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Operator Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., DraftKings"
              data-testid="input-operator-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site URL*</Label>
            <Input
              id="siteUrl"
              value={formData.siteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, siteUrl: e.target.value }))}
              placeholder="https://draftkings.com"
              data-testid="input-operator-site-url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              value={formData.foundedYear}
              onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
              placeholder="2012"
              data-testid="input-operator-founded-year"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headquarters">Headquarters</Label>
            <Input
              id="headquarters"
              value={formData.headquarters}
              onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
              placeholder="Boston, MA, USA"
              data-testid="input-operator-headquarters"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the operator"
            rows={3}
            data-testid="input-operator-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          <div className="space-y-3">
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              placeholder="Logo URL or upload a file below"
              data-testid="input-operator-logo"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">or</span>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={async () => {
                  const response = await apiRequest('POST', '/api/admin/logos/upload');
                  const data = await response.json();
                  return {
                    method: 'PUT' as const,
                    url: data.uploadURL,
                  };
                }}
                onComplete={(result: any) => {
                  console.log('🔍 Upload complete result:', result);
                  console.log('🔍 Upload successful?', result.successful);
                  console.log('🔍 Upload failed?', result.failed);
                  if (result.successful && result.successful.length > 0) {
                    const uploadedFileURL = result.successful[0].uploadURL;
                    console.log('Raw uploaded file URL:', uploadedFileURL);
                    
                    // Extract the actual file path from the Google Cloud Storage URL
                    // URL format: https://storage.googleapis.com/bucket/public/logos/filename?params
                    // We need: /public-objects/logos/filename
                    const urlMatch = uploadedFileURL.match(/\/public\/(.+?)\?/);
                    const actualFilePath = urlMatch ? `/public-objects/${urlMatch[1]}` : uploadedFileURL;
                    console.log('Extracted file path:', actualFilePath);
                    
                    // Update the operator logo via API
                    if (operator?.id) {
                      console.log('Updating existing operator logo...');
                      apiRequest('PUT', `/api/admin/operators/${operator.id}/logo`, {
                        logoURL: actualFilePath
                      }).then(async (res) => {
                        const data = await res.json();
                        console.log('Logo update response:', data);
                        setFormData(prev => ({ ...prev, logo: data.logoPath }));
                        toast({
                          title: "Logo Updated!",
                          description: "The operator logo has been updated successfully.",
                        });
                      }).catch(error => {
                        console.error('Logo update error:', error);
                        toast({
                          title: "Logo Update Failed",
                          description: "Failed to update the operator logo.",
                          variant: "destructive",
                        });
                      });
                    } else {
                      // For new operators, just set the extracted path
                      console.log('Setting logo for new operator:', actualFilePath);
                      setFormData(prev => ({ ...prev, logo: actualFilePath }));
                    }
                  } else {
                    console.error('Upload failed or no files uploaded:', result);
                    toast({
                      title: "Upload Failed",
                      description: "The logo upload was not successful.",
                      variant: "destructive",
                    });
                  }
                }}
                buttonClassName="text-sm"
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload Logo
              </ObjectUploader>
            </div>
            {formData.logo && formData.logo.startsWith('/public-objects/') && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>✓</span>
                <span>Logo uploaded successfully</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Ratings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trustScore">Trust Score (1-10)</Label>
            <Input
              id="trustScore"
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={formData.trustScore}
              onChange={(e) => setFormData(prev => ({ ...prev, trustScore: e.target.value }))}
              data-testid="input-operator-trust-score"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
            <Input
              id="overallRating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.overallRating}
              onChange={(e) => setFormData(prev => ({ ...prev, overallRating: e.target.value }))}
              data-testid="input-operator-overall-rating"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonusRating">Bonus Rating (1-5)</Label>
            <Input
              id="bonusRating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.bonusRating}
              onChange={(e) => setFormData(prev => ({ ...prev, bonusRating: e.target.value }))}
              data-testid="input-operator-bonus-rating"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="oddsRating">Odds Rating (1-5)</Label>
            <Input
              id="oddsRating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.oddsRating}
              onChange={(e) => setFormData(prev => ({ ...prev, oddsRating: e.target.value }))}
              data-testid="input-operator-odds-rating"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Payment Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethods">Payment Methods (comma separated)</Label>
            <Textarea
              id="paymentMethods"
              value={formData.paymentMethods}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethods: e.target.value }))}
              placeholder="Credit Card, PayPal, Bank Transfer, Crypto"
              rows={3}
              data-testid="input-operator-payment-methods"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalMethods">Withdrawal Methods (comma separated)</Label>
            <Textarea
              id="withdrawalMethods"
              value={formData.withdrawalMethods}
              onChange={(e) => setFormData(prev => ({ ...prev, withdrawalMethods: e.target.value }))}
              placeholder="Bank Transfer, PayPal, Check, Crypto"
              rows={3}
              data-testid="input-operator-withdrawal-methods"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minDeposit">Minimum Deposit</Label>
            <Input
              id="minDeposit"
              type="number"
              step="0.01"
              value={formData.minDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, minDeposit: e.target.value }))}
              placeholder="10.00"
              data-testid="input-operator-min-deposit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxWithdrawal">Maximum Withdrawal</Label>
            <Input
              id="maxWithdrawal"
              type="number"
              step="0.01"
              value={formData.maxWithdrawal}
              onChange={(e) => setFormData(prev => ({ ...prev, maxWithdrawal: e.target.value }))}
              placeholder="50000.00"
              data-testid="input-operator-max-withdrawal"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdrawalTimeframe">Withdrawal Timeframe</Label>
          <Input
            id="withdrawalTimeframe"
            value={formData.withdrawalTimeframe}
            onChange={(e) => setFormData(prev => ({ ...prev, withdrawalTimeframe: e.target.value }))}
            placeholder="1-3 business days"
            data-testid="input-operator-withdrawal-timeframe"
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Features</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'liveChat', label: 'Live Chat' },
            { key: 'mobileApp', label: 'Mobile App' },
            { key: 'casinoGames', label: 'Casino Games' },
            { key: 'liveCasino', label: 'Live Casino' },
            { key: 'esports', label: 'Esports' },
            { key: 'virtuals', label: 'Virtual Sports' },
            { key: 'active', label: 'Active' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={formData[key as keyof typeof formData] as boolean}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [key]: checked }))}
                data-testid={`checkbox-operator-${key}`}
              />
              <Label htmlFor={key}>{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          data-testid="button-save-operator"
        >
          {mutation.isPending ? "Saving..." : (operator ? "Update Operator" : "Add Operator")}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          data-testid="button-cancel-operator"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};