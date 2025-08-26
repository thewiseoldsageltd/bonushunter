import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Eye, Trash2, TrendingUp, BarChart3, Users, Zap, Sparkles, Upload } from "lucide-react";
import { calculateBonusEV, getEVRating } from "@/lib/evCalculator";
import { OperatorForm } from "@/components/OperatorForm";

interface BonusFormData {
  title: string;
  description: string;
  bonusType: string;
  productType: string;
  operatorId: string;
  matchPercent: string;
  minDeposit: string;
  maxBonus: string;
  promoCode: string;
  landingUrl: string;
  wageringRequirement: string;
  expiryDays: string;
  valueScore: string;
  termsAndConditions: string;
}

interface OperatorFormData {
  name: string;
  siteUrl: string;
  description: string;
  logoUrl: string;
  trustScore: string;
  overallRating: string;
  licenseInfo: string;
  supportedJurisdictions: string[];
  isActive: boolean;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [editingOperator, setEditingOperator] = useState<any>(null);

  // Form state for new bonus
  const [bonusForm, setBonusForm] = useState<BonusFormData>({
    title: '',
    description: '',
    bonusType: 'welcome',
    productType: 'sportsbook',
    operatorId: '',
    matchPercent: '100',
    minDeposit: '10',
    maxBonus: '0',
    promoCode: '',
    landingUrl: '',
    wageringRequirement: '1',
    expiryDays: '30',
    valueScore: '85',
    termsAndConditions: ''
  });

  const [editCalculatedEV, setEditCalculatedEV] = useState(() => 
    calculateBonusEV({
      matchPercent: '100',
      maxBonus: '0',
      minDeposit: '10',
      wageringRequirement: '1',
      expiryDays: '30',
      productType: 'sportsbook',
      gameWeightings: {},
      maxCashout: '',
      paymentMethodExclusions: []
    })
  );

  // Form state for editing bonus
  const [editBonusForm, setEditBonusForm] = useState<BonusFormData>({
    title: '',
    description: '',
    bonusType: 'welcome',
    productType: 'sportsbook',
    operatorId: '',
    matchPercent: '100',
    minDeposit: '10',
    maxBonus: '0',
    promoCode: '',
    landingUrl: '',
    wageringRequirement: '1',
    expiryDays: '30',
    valueScore: '85',
    termsAndConditions: ''
  });

  // EV Calculation State
  const [calculatedEV, setCalculatedEV] = useState(() => 
    calculateBonusEV({
      matchPercent: bonusForm.matchPercent,
      maxBonus: bonusForm.maxBonus,
      minDeposit: bonusForm.minDeposit,
      wageringRequirement: bonusForm.wageringRequirement,
      expiryDays: bonusForm.expiryDays,
      productType: bonusForm.productType,
      gameWeightings: {},
      maxCashout: '',
      paymentMethodExclusions: []
    })
  );

  const [showAddForm, setShowAddForm] = useState(false);

  // Recalculate EV when form changes
  React.useEffect(() => {
    const newEV = calculateBonusEV({
      matchPercent: bonusForm.matchPercent,
      maxBonus: bonusForm.maxBonus,
      minDeposit: bonusForm.minDeposit,
      wageringRequirement: bonusForm.wageringRequirement,
      expiryDays: bonusForm.expiryDays,
      productType: bonusForm.productType,
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

  // Recalculate EV for edit form
  React.useEffect(() => {
    const newEV = calculateBonusEV({
      matchPercent: editBonusForm.matchPercent,
      maxBonus: editBonusForm.maxBonus,
      minDeposit: editBonusForm.minDeposit,
      wageringRequirement: editBonusForm.wageringRequirement,
      expiryDays: editBonusForm.expiryDays,
      productType: editBonusForm.productType,
      gameWeightings: {},
      maxCashout: '',
      paymentMethodExclusions: []
    });
    setEditCalculatedEV(newEV);
    
    setEditBonusForm(prev => ({ 
      ...prev, 
      valueScore: newEV.valueScore.toString() 
    }));
  }, [editBonusForm.matchPercent, editBonusForm.maxBonus, editBonusForm.minDeposit, editBonusForm.wageringRequirement, editBonusForm.expiryDays, editBonusForm.productType]);

  // Pre-populate edit form when editing bonus changes
  React.useEffect(() => {
    if (editingBonus) {
      setEditBonusForm({
        title: editingBonus.title || '',
        description: editingBonus.description || '',
        bonusType: editingBonus.bonusType || 'welcome',
        productType: editingBonus.productType || 'sportsbook',
        operatorId: editingBonus.operatorId || '',
        matchPercent: editingBonus.matchPercent?.toString() || '100',
        minDeposit: editingBonus.minDeposit?.toString() || '10',
        maxBonus: editingBonus.maxBonus?.toString() || '0',
        promoCode: editingBonus.promoCode || '',
        landingUrl: editingBonus.landingUrl || '',
        wageringRequirement: editingBonus.wageringRequirement?.toString() || '1',
        expiryDays: editingBonus.expiryDays?.toString() || '30',
        valueScore: editingBonus.valueScore?.toString() || '85',
        termsAndConditions: editingBonus.termsAndConditions || ''
      });
    }
  }, [editingBonus]);

  // Fetch all bonuses
  const { data: bonusesData, isLoading: loadingBonuses } = useQuery({
    queryKey: ['/api/bonuses']
  });

  // Fetch all operators for the dropdown
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
        description: "The bonus has been added with calculated EV score.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      resetForm();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Could not add bonus",
        variant: "destructive",
      });
    }
  });

  // Delete bonus mutation
  const deleteBonusMutation = useMutation({
    mutationFn: async (bonusId: string) => {
      await apiRequest('DELETE', `/api/admin/bonuses/${bonusId}`);
    },
    onSuccess: () => {
      toast({
        title: "Bonus Deleted",
        description: "The bonus has been removed from your platform.",
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

  const updateBonusMutation = useMutation({
    mutationFn: async (formData: BonusFormData & { id: string }) => {
      const { id, ...data } = formData;
      const response = await apiRequest('PUT', `/api/admin/bonuses/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bonus Updated Successfully!",
        description: "The bonus changes have been saved and EV recalculated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      setEditingBonus(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update bonus",
        variant: "destructive",
      });
    }
  });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (termsText: string) => {
      const response = await apiRequest('POST', '/api/admin/analyze-terms', { termsText });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Analysis Complete!",
        description: "Bonus parameters extracted and form auto-populated.",
      });
      
      // Auto-populate form with AI-extracted parameters
      const params = data.parameters;
      setBonusForm(prev => ({
        ...prev,
        title: params.title || prev.title,
        description: params.description || prev.description,
        bonusType: params.bonusType || prev.bonusType,
        productType: params.productType || prev.productType,
        matchPercent: params.matchPercent?.toString() || prev.matchPercent,
        minDeposit: params.minDeposit?.toString() || prev.minDeposit,
        maxBonus: params.maxBonus?.toString() || prev.maxBonus,
        wageringRequirement: params.wageringRequirement?.toString() || prev.wageringRequirement,
        expiryDays: params.expiryDays?.toString() || prev.expiryDays,
        promoCode: params.promoCode || prev.promoCode
      }));
    },
    onError: (error: any) => {
      toast({
        title: "AI Analysis Failed",
        description: error.message || "Could not analyze terms. Please check the text and try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeTerms = () => {
    if (!bonusForm.termsAndConditions.trim()) {
      toast({
        title: "Missing Terms & Conditions",
        description: "Please paste the terms and conditions text first.",
        variant: "destructive",
      });
      return;
    }
    aiAnalysisMutation.mutate(bonusForm.termsAndConditions);
  };

  const resetForm = () => {
    setBonusForm({
      title: '',
      description: '',
      bonusType: 'welcome',
      productType: 'sportsbook',
      operatorId: '',
      matchPercent: '100',
      minDeposit: '10',
      maxBonus: '0',
      promoCode: '',
      landingUrl: '',
      wageringRequirement: '1',
      expiryDays: '30',
      valueScore: '85',
      termsAndConditions: ''
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

  const handleUpdateBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBonusForm.title || !editBonusForm.operatorId || !editBonusForm.landingUrl) {
      toast({
        title: "Missing Required Fields", 
        description: "Please fill in title, operator, and landing URL.",
        variant: "destructive",
      });
      return;
    }
    updateBonusMutation.mutate({ ...editBonusForm, id: editingBonus.id });
  };

  const bonuses = (bonusesData as any)?.bonuses || [];
  const operators = (operatorsData as any)?.operators || [];
  const stats = {
    totalBonuses: bonuses.length,
    activeOperators: operators.length,
    systemStatus: bonuses.length > 0 ? 'LIVE' : 'SETUP'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Bonushunter Admin</h1>
            <Badge variant={stats.systemStatus === 'LIVE' ? 'default' : 'outline'} className="ml-2">
              {stats.systemStatus}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Intelligent bonus management with AI-powered EV calculation and analysis
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBonuses}</div>
              <p className="text-xs text-muted-foreground">
                Active gambling bonuses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOperators}</div>
              <p className="text-xs text-muted-foreground">
                Connected gambling sites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GPT-5</div>
              <p className="text-xs text-muted-foreground">
                Terms & Conditions parser
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="bonuses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="bonuses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bonus Management</CardTitle>
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  data-testid="button-add-bonus"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bonus
                </Button>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Add New Bonus</h3>

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
                          <Label htmlFor="operator">Operator*</Label>
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
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={bonusForm.description}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Get a 100% deposit match bonus up to $1,000..."
                          rows={3}
                          data-testid="textarea-description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bonusType">Bonus Type</Label>
                          <Select 
                            value={bonusForm.bonusType} 
                            onValueChange={(value) => setBonusForm(prev => ({ ...prev, bonusType: value }))}
                          >
                            <SelectTrigger data-testid="select-bonus-type">
                              <SelectValue placeholder="Select bonus type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="welcome">Welcome</SelectItem>
                              <SelectItem value="deposit">Deposit Match</SelectItem>
                              <SelectItem value="no-deposit">No Deposit</SelectItem>
                              <SelectItem value="free-bet">Free Bet</SelectItem>
                              <SelectItem value="cashback">Cashback</SelectItem>
                              <SelectItem value="reload">Reload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="productType">Product Type</Label>
                          <Select 
                            value={bonusForm.productType} 
                            onValueChange={(value) => setBonusForm(prev => ({ ...prev, productType: value }))}
                          >
                            <SelectTrigger data-testid="select-product-type">
                              <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sportsbook">Sportsbook</SelectItem>
                              <SelectItem value="casino">Casino</SelectItem>
                              <SelectItem value="poker">Poker</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="matchPercent">Match Percentage (%)</Label>
                          <Input
                            id="matchPercent"
                            type="number"
                            value={bonusForm.matchPercent}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, matchPercent: e.target.value }))}
                            placeholder="100"
                            data-testid="input-match-percent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="promoCode">Promo Code</Label>
                          <Input
                            id="promoCode"
                            value={bonusForm.promoCode}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, promoCode: e.target.value }))}
                            placeholder="BONUS1000"
                            data-testid="input-promo-code"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label>
                          <Input
                            id="wageringRequirement"
                            type="number"
                            value={bonusForm.wageringRequirement}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, wageringRequirement: e.target.value }))}
                            placeholder="35"
                            data-testid="input-wagering"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDays">Expiry (Days)</Label>
                          <Input
                            id="expiryDays"
                            type="number"
                            value={bonusForm.expiryDays}
                            onChange={(e) => setBonusForm(prev => ({ ...prev, expiryDays: e.target.value }))}
                            placeholder="30"
                            data-testid="input-expiry"
                          />
                        </div>
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

                      {/* Terms & Conditions AI Analysis Section */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          <Label htmlFor="terms-conditions" className="text-blue-900 dark:text-blue-100 font-medium">
                            Terms & Conditions (AI Analysis)
                          </Label>
                        </div>
                        <Textarea
                          id="terms-conditions"
                          value={bonusForm.termsAndConditions}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                          placeholder="Paste the full terms and conditions text here. Our AI will automatically extract bonus parameters like wagering requirements, expiry dates, game restrictions, etc."
                          rows={6}
                          className="mb-3"
                          data-testid="textarea-terms-conditions"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleAnalyzeTerms}
                            disabled={aiAnalysisMutation.isPending || !bonusForm.termsAndConditions.trim()}
                            variant="outline"
                            className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                            data-testid="button-analyze-terms"
                          >
                            {aiAnalysisMutation.isPending ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Analyze with AI
                              </>
                            )}
                          </Button>
                          <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
                            <span>💡 AI will auto-populate form fields from T&C text</span>
                          </div>
                        </div>
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
                              onClick={() => setEditingBonus(bonus)}
                              data-testid={`button-edit-${bonus.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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

        {/* Edit Bonus Dialog - Outside of all tabs */}
        <Dialog open={!!editingBonus} onOpenChange={(open) => !open && setEditingBonus(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Bonus: {editingBonus?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {editingBonus && (
                <div>
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
                    <strong>DEBUG:</strong> Edit form should show below this message
                  </div>
                  {/* Live EV Display for Edit */}
                  <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Expected Value Analysis (Edit Mode)</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEVRating(editCalculatedEV.valueScore).color} bg-gray-100 dark:bg-gray-800`}>
                        {getEVRating(editCalculatedEV.valueScore).rating} ({editCalculatedEV.valueScore}/100)
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-semibold text-green-700 dark:text-green-400">${editCalculatedEV.breakdown.bonusAmount}</div>
                        <div className="text-gray-600 dark:text-gray-400">Bonus Amount</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-semibold text-red-700 dark:text-red-400">${editCalculatedEV.breakdown.wageringCost}</div>
                        <div className="text-gray-600 dark:text-gray-400">Wagering Cost</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <div className="font-semibold text-orange-700 dark:text-orange-400">${editCalculatedEV.breakdown.penalties}</div>
                        <div className="text-gray-600 dark:text-gray-400">Penalties</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-semibold text-blue-700 dark:text-blue-400">${editCalculatedEV.expectedValue}</div>
                        <div className="text-gray-600 dark:text-gray-400">Net EV</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {getEVRating(editCalculatedEV.valueScore).description} • Based on $100 deposit • RTP: {(editCalculatedEV.breakdown.effectiveRTP * 100).toFixed(1)}%
                    </div>
                  </div>

                  <form onSubmit={handleUpdateBonus} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-title">Title*</Label>
                        <Input
                          id="edit-title"
                          value={editBonusForm.title}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="FanDuel No Sweat First Bet"
                          required
                          data-testid="input-edit-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-operator">Operator*</Label>
                        <Select 
                          value={editBonusForm.operatorId} 
                          onValueChange={(value) => setEditBonusForm(prev => ({ ...prev, operatorId: value }))}
                        >
                          <SelectTrigger data-testid="select-edit-operator">
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
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editBonusForm.description}
                        onChange={(e) => setEditBonusForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Get a 100% deposit match bonus up to $1,000..."
                        rows={3}
                        data-testid="textarea-edit-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-bonus-type">Bonus Type</Label>
                        <Select 
                          value={editBonusForm.bonusType} 
                          onValueChange={(value) => setEditBonusForm(prev => ({ ...prev, bonusType: value }))}
                        >
                          <SelectTrigger data-testid="select-edit-bonus-type">
                            <SelectValue placeholder="Select bonus type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome</SelectItem>
                            <SelectItem value="deposit">Deposit Match</SelectItem>
                            <SelectItem value="no-deposit">No Deposit</SelectItem>
                            <SelectItem value="free-bet">Free Bet</SelectItem>
                            <SelectItem value="cashback">Cashback</SelectItem>
                            <SelectItem value="reload">Reload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-product-type">Product Type</Label>
                        <Select 
                          value={editBonusForm.productType} 
                          onValueChange={(value) => setEditBonusForm(prev => ({ ...prev, productType: value }))}
                        >
                          <SelectTrigger data-testid="select-edit-product-type">
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sportsbook">Sportsbook</SelectItem>
                            <SelectItem value="casino">Casino</SelectItem>
                            <SelectItem value="poker">Poker</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-match-percent">Match Percentage (%)</Label>
                        <Input
                          id="edit-match-percent"
                          type="number"
                          value={editBonusForm.matchPercent}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, matchPercent: e.target.value }))}
                          placeholder="100"
                          data-testid="input-edit-match-percent"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-promo-code">Promo Code</Label>
                        <Input
                          id="edit-promo-code"
                          value={editBonusForm.promoCode}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, promoCode: e.target.value }))}
                          placeholder="BONUS1000"
                          data-testid="input-edit-promo-code"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-wagering">Wagering Requirement (x)</Label>
                        <Input
                          id="edit-wagering"
                          type="number"
                          value={editBonusForm.wageringRequirement}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, wageringRequirement: e.target.value }))}
                          placeholder="35"
                          data-testid="input-edit-wagering"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-expiry">Expiry (Days)</Label>
                        <Input
                          id="edit-expiry"
                          type="number"
                          value={editBonusForm.expiryDays}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, expiryDays: e.target.value }))}
                          placeholder="30"
                          data-testid="input-edit-expiry"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-min-deposit">Min Deposit ($)</Label>
                        <Input
                          id="edit-min-deposit"
                          type="number"
                          value={editBonusForm.minDeposit}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, minDeposit: e.target.value }))}
                          placeholder="10"
                          data-testid="input-edit-min-deposit"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-max-bonus">Max Bonus ($)</Label>
                        <Input
                          id="edit-max-bonus"
                          type="number"
                          value={editBonusForm.maxBonus}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, maxBonus: e.target.value }))}
                          placeholder="1000"
                          data-testid="input-edit-max-bonus"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-valueScore">Value Score (Auto-Calculated)</Label>
                        <Input
                          id="edit-valueScore"
                          type="number"
                          value={editBonusForm.valueScore}
                          onChange={(e) => setEditBonusForm(prev => ({ ...prev, valueScore: e.target.value }))}
                          placeholder="88"
                          data-testid="input-edit-value-score"
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
                      <Label htmlFor="edit-landing-url">Landing URL*</Label>
                      <Input
                        id="edit-landing-url"
                        type="url"
                        value={editBonusForm.landingUrl}
                        onChange={(e) => setEditBonusForm(prev => ({ ...prev, landingUrl: e.target.value }))}
                        placeholder="https://fanduel.com/promo/no-sweat-first-bet"
                        required
                        data-testid="input-edit-landing-url"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={updateBonusMutation.isPending}
                        data-testid="button-update-bonus"
                      >
                        {updateBonusMutation.isPending ? "Updating..." : "Update Bonus"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setEditingBonus(null)}
                        data-testid="button-cancel-edit-bonus"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
      </div>
    </div>
  );
};

export default AdminDashboard;