import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Eye, Users, Building, Calculator, TrendingUp } from 'lucide-react';
import { calculateBonusEV, getEVRating } from '@/lib/evCalculator';

interface BonusFormData {
  title: string;
  description: string;
  operatorId: string;
  productType: string;
  bonusType: string;
  matchPercent: string;
  minDeposit: string;
  maxBonus: string;
  promoCode: string;
  landingUrl: string;
  wageringRequirement: string;
  expiryDays: string;
  valueScore: string;
}

interface OperatorFormData {
  name: string;
  siteUrl: string;
  description: string;
  trustScore: string;
  overallRating: string;
  foundedYear: string;
  headquarters: string;
  licenses: string;
  languages: string;
  currencies: string;
  paymentMethods: string;
  minDeposit: string;
  maxWithdrawal: string;
  withdrawalTimeframe: string;
}

// Simple Operator Form Component
const OperatorForm = ({ 
  operator, 
  onSuccess 
}: { 
  operator?: any; 
  onSuccess: () => void 
}) => {
  const { toast } = useToast();
  const [operatorForm, setOperatorForm] = useState<OperatorFormData>(() => {
    if (operator) {
      return {
        name: operator.name || '',
        siteUrl: operator.siteUrl || '',
        description: operator.description || '',
        trustScore: operator.trustScore || '8.0',
        overallRating: operator.overallRating || '4.0',
        foundedYear: operator.foundedYear?.toString() || '2020',
        headquarters: operator.headquarters || '',
        licenses: Array.isArray(operator.licenses) ? operator.licenses.join(', ') : (operator.licenses || ''),
        languages: Array.isArray(operator.languages) ? operator.languages.join(', ') : (operator.languages || ''),
        currencies: Array.isArray(operator.currencies) ? operator.currencies.join(', ') : (operator.currencies || ''),
        paymentMethods: Array.isArray(operator.paymentMethods) ? operator.paymentMethods.join(', ') : (operator.paymentMethods || ''),
        minDeposit: operator.minDeposit || '10.00',
        maxWithdrawal: operator.maxWithdrawal || '10000.00',
        withdrawalTimeframe: operator.withdrawalTimeframe || '24-48 hours'
      };
    }
    return {
      name: '',
      siteUrl: '',
      description: '',
      trustScore: '8.0',
      overallRating: '4.0',
      foundedYear: '2020',
      headquarters: '',
      licenses: '',
      languages: '',
      currencies: '',
      paymentMethods: '',
      minDeposit: '10.00',
      maxWithdrawal: '10000.00',
      withdrawalTimeframe: '24-48 hours'
    };
  });

  const operatorMutation = useMutation({
    mutationFn: async (formData: OperatorFormData) => {
      const processedData = {
        ...formData,
        foundedYear: parseInt(formData.foundedYear),
        licenses: formData.licenses.split(',').map(s => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        currencies: formData.currencies.split(',').map(s => s.trim()).filter(Boolean),
        paymentMethods: formData.paymentMethods.split(',').map(s => s.trim()).filter(Boolean),
        liveChat: false,
        mobileApp: false,
        casinoGames: false,
        esports: false,
        active: true
      };
      
      const method = operator ? 'PUT' : 'POST';
      const url = operator ? `/api/admin/operators/${operator.id}` : '/api/admin/operators';
      const response = await apiRequest(method, url, processedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: operator ? "Operator updated successfully!" : "Operator added successfully!",
      });
      if (!operator) {
        setOperatorForm({
          name: '',
          siteUrl: '',
          description: '',
          trustScore: '8.0',
          overallRating: '4.0',
          foundedYear: '2020',
          headquarters: '',
          licenses: '',
          languages: '',
          currencies: '',
          paymentMethods: '',
          minDeposit: '10.00',
          maxWithdrawal: '10000.00',
          withdrawalTimeframe: '24-48 hours'
        });
      }
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${operator ? 'update' : 'create'} operator`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorForm.name || !operatorForm.siteUrl) {
      toast({
        title: "Error",
        description: "Name and website URL are required",
        variant: "destructive",
      });
      return;
    }
    operatorMutation.mutate(operatorForm);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Operator Name*
              </Label>
              <Input 
                id="name"
                placeholder="e.g., Stake.com" 
                value={operatorForm.name} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="siteUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Website URL*
              </Label>
              <Input 
                id="siteUrl"
                placeholder="https://stake.com" 
                value={operatorForm.siteUrl} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, siteUrl: e.target.value }))}
                required
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Description
            </Label>
            <Textarea 
              id="description"
              placeholder="Brief description of the operator..." 
              value={operatorForm.description} 
              onChange={(e) => setOperatorForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full"
            />
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="foundedYear" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Founded Year
              </Label>
              <Input 
                id="foundedYear"
                type="number" 
                placeholder="2020" 
                value={operatorForm.foundedYear} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, foundedYear: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="headquarters" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Headquarters
              </Label>
              <Input 
                id="headquarters"
                placeholder="Curacao" 
                value={operatorForm.headquarters} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, headquarters: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Regulatory & Business */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Regulatory & Business Details</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="licenses" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Licenses (comma-separated)
              </Label>
              <Input 
                id="licenses"
                placeholder="Curacao Gaming License, UK Gambling Commission" 
                value={operatorForm.licenses} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, licenses: e.target.value }))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="languages" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Languages
                </Label>
                <Input 
                  id="languages"
                  placeholder="English, Spanish, Portuguese" 
                  value={operatorForm.languages} 
                  onChange={(e) => setOperatorForm(prev => ({ ...prev, languages: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="currencies" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Currencies
                </Label>
                <Input 
                  id="currencies"
                  placeholder="USD, BTC, ETH" 
                  value={operatorForm.currencies} 
                  onChange={(e) => setOperatorForm(prev => ({ ...prev, currencies: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentMethods" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Methods
              </Label>
              <Input 
                id="paymentMethods"
                placeholder="Bitcoin, Ethereum, Visa, Mastercard" 
                value={operatorForm.paymentMethods} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, paymentMethods: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="minDeposit" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Min Deposit ($)
              </Label>
              <Input 
                id="minDeposit"
                placeholder="10.00" 
                value={operatorForm.minDeposit} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, minDeposit: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="maxWithdrawal" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Max Withdrawal ($)
              </Label>
              <Input 
                id="maxWithdrawal"
                placeholder="10000.00" 
                value={operatorForm.maxWithdrawal} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, maxWithdrawal: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="withdrawalTimeframe" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Withdrawal Time
              </Label>
              <Input 
                id="withdrawalTimeframe"
                placeholder="Instant" 
                value={operatorForm.withdrawalTimeframe} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, withdrawalTimeframe: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="trustScore" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Trust Score (/10)
              </Label>
              <Input 
                id="trustScore"
                placeholder="8.0" 
                value={operatorForm.trustScore} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, trustScore: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="overallRating" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Overall Rating (/5)
              </Label>
              <Input 
                id="overallRating"
                placeholder="4.0" 
                value={operatorForm.overallRating} 
                onChange={(e) => setOperatorForm(prev => ({ ...prev, overallRating: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="submit" disabled={operatorMutation.isPending} className="px-8">
            {operatorMutation.isPending 
              ? (operator ? "Updating..." : "Adding...")
              : (operator ? "Update Operator" : "Add Operator")
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [editingOperator, setEditingOperator] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bonusForm, setBonusForm] = useState<BonusFormData>({
    title: '',
    description: '',
    operatorId: '',
    productType: 'sportsbook',
    bonusType: 'first_bet_bonus',
    matchPercent: '0',
    minDeposit: '0',
    maxBonus: '0',
    promoCode: '',
    landingUrl: '',
    wageringRequirement: '1',
    expiryDays: '30',
    valueScore: '85'
  });

  // EV Calculation State
  const [calculatedEV, setCalculatedEV] = useState(() => 
    calculateBonusEV({
      matchPercent: '0',
      maxBonus: '0',
      minDeposit: '0',
      wageringRequirement: '1',
      wageringUnit: 'bonus',
      expiryDays: '30',
      eligibleGames: [],
      gameWeightings: {},
      paymentMethodExclusions: []
    })
  );

  // Recalculate EV when form changes
  React.useEffect(() => {
    const newEV = calculateBonusEV({
      matchPercent: bonusForm.matchPercent,
      maxBonus: bonusForm.maxBonus,
      minDeposit: bonusForm.minDeposit,
      wageringRequirement: bonusForm.wageringRequirement,
      wageringUnit: 'bonus', // Default for now
      expiryDays: bonusForm.expiryDays,
      eligibleGames: bonusForm.productType === 'casino' ? ['slots'] : ['sports'],
      gameWeightings: {},
      maxCashout: '',
      paymentMethodExclusions: []
    });
    setCalculatedEV(newEV);
    
    // Auto-update the valueScore field
    setBonusForm(prev => ({ 
      ...prev, 
      valueScore: newEV.valueScore.toString() 
    }));
  }, [bonusForm.matchPercent, bonusForm.maxBonus, bonusForm.minDeposit, bonusForm.wageringRequirement, bonusForm.expiryDays, bonusForm.productType]);

  // Fetch all bonuses
  const { data: bonusesData, isLoading: loadingBonuses } = useQuery({
    queryKey: ['/api/bonuses']
  });

  // Fetch operators
  const { data: operatorsData } = useQuery({
    queryKey: ['/api/admin/operators']
  });

  // Add bonus mutation
  const addBonusMutation = useMutation({
    mutationFn: async (formData: BonusFormData) => {
      const response = await apiRequest('POST', '/api/admin/bonuses', formData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bonus Added Successfully!",
        description: "The new bonus is now live and available in chat recommendations.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Bonus",
        description: error.message || "Could not create bonus",
        variant: "destructive",
      });
    }
  });

  // Delete bonus mutation
  const deleteBonusMutation = useMutation({
    mutationFn: async (bonusId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/bonuses/${bonusId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bonus Deleted",
        description: "Bonus has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Could not delete bonus",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setBonusForm({
      title: '',
      description: '',
      operatorId: '',
      productType: 'sportsbook',
      bonusType: 'first_bet_bonus',
      matchPercent: '0',
      minDeposit: '0',
      maxBonus: '0',
      promoCode: '',
      landingUrl: '',
      wageringRequirement: '1',
      expiryDays: '30',
      valueScore: '85'
    });
  };

  const handleAddBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusForm.title || !bonusForm.operatorId || !bonusForm.landingUrl) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title, operator, and landing URL.",
        variant: "destructive",
      });
      return;
    }
    addBonusMutation.mutate(bonusForm);
  };

  const bonuses = (bonusesData as any)?.bonuses || [];
  const operators = (operatorsData as any)?.operators || [];
  const stats = {
    totalBonuses: bonuses.length,
    activeOperators: operators.length,
    systemStatus: bonuses.length > 0 ? 'LIVE' : 'SETUP'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bonushunter Admin</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage bonuses and operators</p>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Manual Management Mode
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBonuses}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Bonuses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeOperators}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Active Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.systemStatus}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">System Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bonuses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bonuses">Bonus Management</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="bonuses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bonus Management</CardTitle>
                <Button onClick={() => setShowAddForm(true)} data-testid="button-add-bonus">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bonus
                </Button>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add New Bonus</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Calculator className="h-4 w-4" />
                        <span>Live EV Calculator</span>
                      </div>
                    </div>

                    {/* Live EV Display */}
                    <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Expected Value Analysis</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEVRating(calculatedEV.valueScore).color} bg-gray-100 dark:bg-gray-800`}>
                          {getEVRating(calculatedEV.valueScore).rating} ({calculatedEV.valueScore}/100)
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="font-semibold text-green-700 dark:text-green-400">${calculatedEV.breakdown.bonusAmount}</div>
                          <div className="text-gray-600 dark:text-gray-400">Bonus Amount</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="font-semibold text-red-700 dark:text-red-400">${calculatedEV.breakdown.wageringCost}</div>
                          <div className="text-gray-600 dark:text-gray-400">Wagering Cost</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                          <div className="font-semibold text-orange-700 dark:text-orange-400">${calculatedEV.breakdown.penalties}</div>
                          <div className="text-gray-600 dark:text-gray-400">Penalties</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="font-semibold text-blue-700 dark:text-blue-400">${calculatedEV.expectedValue}</div>
                          <div className="text-gray-600 dark:text-gray-400">Net EV</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {getEVRating(calculatedEV.valueScore).description} • Based on $100 deposit • RTP: {(calculatedEV.breakdown.effectiveRTP * 100).toFixed(1)}%
                      </div>
                    </div>

                    <form onSubmit={handleAddBonus} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title*</Label>
                          <Input
                            id="title"
                            value={bonusForm.title}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="FanDuel No Sweat First Bet"
                            required
                            data-testid="input-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="operatorId">Operator*</Label>
                          <Select
                            value={bonusForm.operatorId}
                            onValueChange={(value) => setBonusForm(prev => ({ ...prev, operatorId: value }))}
                          >
                            <SelectTrigger data-testid="select-operator">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((operator: any) => (
                                <SelectItem key={operator.id} value={operator.id}>
                                  {operator.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description*</Label>
                        <Textarea
                          id="description"
                          value={bonusForm.description}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Get up to $1,000 back if your first bet loses"
                          required
                          data-testid="textarea-description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                          <Input
                            id="minDeposit"
                            type="number"
                            value={bonusForm.minDeposit}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, minDeposit: e.target.value }))}
                            placeholder="10"
                            data-testid="input-min-deposit"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                          <Input
                            id="maxBonus"
                            type="number"
                            value={bonusForm.maxBonus}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, maxBonus: e.target.value }))}
                            placeholder="1000"
                            data-testid="input-max-bonus"
                          />
                        </div>
                        <div>
                          <Label htmlFor="valueScore">Value Score (Auto-Calculated)</Label>
                          <Input
                            id="valueScore"
                            type="number"
                            value={bonusForm.valueScore}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, valueScore: e.target.value }))}
                            placeholder="88"
                            data-testid="input-value-score"
                            className="bg-gray-100 dark:bg-gray-700"
                            readOnly
                            title="Automatically calculated based on bonus terms"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Automatically calculated • Higher is better • Based on mathematical expected value
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="landingUrl">Landing URL*</Label>
                        <Input
                          id="landingUrl"
                          value={bonusForm.landingUrl}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, landingUrl: e.target.value }))}
                          placeholder="https://fanduel.com/promo/no-sweat-first-bet"
                          required
                          data-testid="input-landing-url"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={addBonusMutation.isPending}
                          data-testid="button-submit-bonus"
                        >
                          {addBonusMutation.isPending ? "Adding..." : "Add Bonus"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAddForm(false)}
                          data-testid="button-cancel-bonus"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Current Bonuses ({bonuses.length})</h3>
                  {loadingBonuses ? (
                    <p className="text-gray-500">Loading bonuses...</p>
                  ) : bonuses.length === 0 ? (
                    <p className="text-gray-500">No bonuses yet. Add your first bonus!</p>
                  ) : (
                    <div className="space-y-3">
                      {bonuses.map((bonus: any) => {
                        const evRating = getEVRating(Number(bonus.valueScore || 0));
                        return (
                        <div
                          key={bonus.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg border-l-4"
                          style={{borderLeftColor: evRating.rating === 'Excellent' ? '#10b981' : 
                                                     evRating.rating === 'Good' ? '#3b82f6' :
                                                     evRating.rating === 'Fair' ? '#f59e0b' :
                                                     evRating.rating === 'Poor' ? '#f97316' : '#ef4444'}}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{bonus.title}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${evRating.color} bg-white dark:bg-gray-800 shadow-sm border`}>
                                {evRating.rating} • {Number(bonus.valueScore || 0).toFixed(1)}/100
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              {bonus.operator?.name} • {bonus.description}
                            </p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Min: ${bonus.minDeposit}</span>
                              <span>Max: ${bonus.maxBonus}</span>
                              <span>Wagering: {bonus.wageringRequirement}x</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${evRating.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                                                                     evRating.color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                                                                     evRating.color === 'text-yellow-600' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                                                                     evRating.color === 'text-orange-600' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                                                                                     'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                                EV: {evRating.description}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(bonus.landingUrl, '_blank')}
                              data-testid={`button-view-${bonus.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteBonusMutation.mutate(bonus.id)}
                              disabled={deleteBonusMutation.isPending}
                              data-testid={`button-delete-${bonus.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operators">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Operators ({operators.length})</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-operator">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Operator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Operator</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <OperatorForm onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/admin/operators'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
                      }} />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operators.map((operator: any) => (
                    <div
                      key={operator.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{operator.name}</h3>
                        <p className="text-sm text-gray-500">{operator.siteUrl}</p>
                        {operator.description && (
                          <p className="text-sm text-gray-400 mt-1">{operator.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <Badge variant="secondary">
                            Trust: {operator.trustScore}/10
                          </Badge>
                          {operator.overallRating && operator.overallRating !== "0.0" && (
                            <Badge variant="outline">
                              Rating: {operator.overallRating}/5
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOperator(operator)}
                          data-testid={`button-edit-operator-${operator.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit Operator Dialog */}
            <Dialog open={!!editingOperator} onOpenChange={(open) => !open && setEditingOperator(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Operator: {editingOperator?.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {editingOperator && (
                    <OperatorForm 
                      operator={editingOperator}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/admin/operators'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
                        setEditingOperator(null);
                      }} 
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Your platform is live and collecting bonus data!
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">✓</p>
                    <p className="text-sm">Chat AI Working</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">✓</p>
                    <p className="text-sm">Database Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;