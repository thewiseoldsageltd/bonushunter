import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
      
      // Process arrays
      const processedData = {
        ...data,
        paymentMethods: data.paymentMethods.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        withdrawalMethods: data.withdrawalMethods.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      };
      
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            value={formData.logo}
            onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
            placeholder="https://example.com/logo.png"
            data-testid="input-operator-logo"
          />
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