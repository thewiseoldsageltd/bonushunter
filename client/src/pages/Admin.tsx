import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Play, Square, RefreshCw, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ScrapingStatus {
  isRunning: boolean;
  lastUpdate?: string;
  bonusesScraped?: number;
  operatorsCount?: number;
}

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

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({ isRunning: false });
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
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

  // Configuration form state
  const [configForm, setConfigForm] = useState({
    operatorName: '', operatorId: '', productType: 'sportsbook',
    bonusPageUrl: '', loginRequired: false,
    containerSelector: '', titleSelector: '', descriptionSelector: '',
    amountSelector: '', wageringSelector: '', endDateSelector: '', claimLinkSelector: ''
  });

  // Fetch all bonuses
  const { data: bonusesData, isLoading: loadingBonuses } = useQuery({
    queryKey: ['/api/bonuses']
  });

  // Fetch operators
  const { data: operatorsData } = useQuery({
    queryKey: ['/api/admin/operators']
  });

  // Fetch scraping configurations
  const { data: configsData, isLoading: loadingConfigs } = useQuery({
    queryKey: ['/api/admin/scraping/configs']
  });

  // Start scraping mutation
  const startScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/scraping/start', { configs: [] });
      return await response.json();
    },
    onSuccess: () => {
      setScrapingStatus({ isRunning: true });
      toast({
        title: "Scraping Started",
        description: "Live bonus data collection has begun!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Could not start bonus scraping",
        variant: "destructive",
      });
    }
  });

  // Stop scraping mutation
  const stopScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/scraping/stop');
      return await response.json();
    },
    onSuccess: () => {
      setScrapingStatus({ isRunning: false });
      toast({
        title: "Scraping Stopped",
        description: "Bonus data collection has been stopped.",
      });
    }
  });

  // Manual scrape mutation
  const manualScrapeMutation = useMutation({
    mutationFn: async (operatorId: string) => {
      const response = await apiRequest('POST', `/api/admin/scraping/manual/${operatorId}`);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      toast({
        title: "Manual Scrape Complete",
        description: `Scraping completed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Manual Scrape Failed",
        description: error.message || "Could not complete manual scrape",
        variant: "destructive",
      });
    }
  });

  // Add bonus mutation
  const addBonusMutation = useMutation({
    mutationFn: async (bonusData: any) => {
      return await fetch('/api/admin/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bonusData)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      setShowAddForm(false);
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
      toast({
        title: "Bonus Added",
        description: "New bonus has been created successfully!",
      });
    }
  });

  const handleAddBonus = () => {
    const bonusData = {
      ...bonusForm,
      matchPercent: parseFloat(bonusForm.matchPercent),
      minDeposit: parseFloat(bonusForm.minDeposit),
      maxBonus: parseFloat(bonusForm.maxBonus),
      wageringRequirement: parseFloat(bonusForm.wageringRequirement),
      expiryDays: parseInt(bonusForm.expiryDays),
      valueScore: parseFloat(bonusForm.valueScore),
      existingUserEligible: false,
      status: 'active'
    };
    addBonusMutation.mutate(bonusData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-dashboard">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Real Data Management
        </Badge>
      </div>

      <Tabs defaultValue="scraping" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scraping">Live Scraping</TabsTrigger>
          <TabsTrigger value="bonuses">Bonus Management</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Scraping Tab */}
        <TabsContent value="scraping">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Automated Bonus Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={scrapingStatus.isRunning ? "default" : "secondary"}>
                        {scrapingStatus.isRunning ? "Running" : "Stopped"}
                      </Badge>
                    </p>
                    {scrapingStatus.lastUpdate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {scrapingStatus.lastUpdate}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startScrapingMutation.mutate()}
                      disabled={scrapingStatus.isRunning || startScrapingMutation.isPending}
                      size="sm"
                      data-testid="button-start-scraping"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Scraping
                    </Button>
                    <Button
                      onClick={() => stopScrapingMutation.mutate()}
                      disabled={!scrapingStatus.isRunning || stopScrapingMutation.isPending}
                      variant="outline"
                      size="sm"
                      data-testid="button-stop-scraping"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(bonusesData as any)?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Bonuses</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">10</p>
                    <p className="text-sm text-muted-foreground">Active Operators</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-sm text-muted-foreground">Jurisdictions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Manual Scraping</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'].map((operator) => (
                      <Button
                        key={operator}
                        variant="outline"
                        size="sm"
                        onClick={() => manualScrapeMutation.mutate(operator.toLowerCase())}
                        disabled={manualScrapeMutation.isPending}
                        data-testid={`button-scrape-${operator.toLowerCase()}`}
                      >
                        Scrape {operator}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bonus Management Tab */}
        <TabsContent value="bonuses">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Bonus Management</h3>
              <Button 
                onClick={() => setShowAddForm(true)}
                data-testid="button-add-bonus"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bonus
              </Button>
            </div>

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Bonus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={bonusForm.title}
                        onChange={(e) => setBonusForm({...bonusForm, title: e.target.value})}
                        placeholder="Bonus title"
                        data-testid="input-bonus-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="operatorId">Operator</Label>
                      <Select value={bonusForm.operatorId} onValueChange={(value) => setBonusForm({...bonusForm, operatorId: value})}>
                        <SelectTrigger data-testid="select-operator">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draftkings">DraftKings</SelectItem>
                          <SelectItem value="fanduel">FanDuel</SelectItem>
                          <SelectItem value="betmgm">BetMGM</SelectItem>
                          <SelectItem value="caesars">Caesars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bonusForm.description}
                      onChange={(e) => setBonusForm({...bonusForm, description: e.target.value})}
                      placeholder="Bonus description"
                      data-testid="input-bonus-description"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <Select value={bonusForm.productType} onValueChange={(value) => setBonusForm({...bonusForm, productType: value})}>
                        <SelectTrigger data-testid="select-product-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sportsbook">Sportsbook</SelectItem>
                          <SelectItem value="casino">Casino</SelectItem>
                          <SelectItem value="poker">Poker</SelectItem>
                          <SelectItem value="crypto_casino">Crypto Casino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                      <Input
                        id="maxBonus"
                        type="number"
                        value={bonusForm.maxBonus}
                        onChange={(e) => setBonusForm({...bonusForm, maxBonus: e.target.value})}
                        data-testid="input-max-bonus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                      <Input
                        id="minDeposit"
                        type="number"
                        value={bonusForm.minDeposit}
                        onChange={(e) => setBonusForm({...bonusForm, minDeposit: e.target.value})}
                        data-testid="input-min-deposit"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valueScore">Value Score</Label>
                      <Input
                        id="valueScore"
                        type="number"
                        value={bonusForm.valueScore}
                        onChange={(e) => setBonusForm({...bonusForm, valueScore: e.target.value})}
                        data-testid="input-value-score"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landingUrl">Landing URL</Label>
                    <Input
                      id="landingUrl"
                      value={bonusForm.landingUrl}
                      onChange={(e) => setBonusForm({...bonusForm, landingUrl: e.target.value})}
                      placeholder="https://operator.com/promo"
                      data-testid="input-landing-url"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddBonus}
                      disabled={addBonusMutation.isPending}
                      data-testid="button-save-bonus"
                    >
                      Save Bonus
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                      data-testid="button-cancel-add"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {loadingBonuses ? (
                <p>Loading bonuses...</p>
              ) : (
                (bonusesData as any)?.bonuses?.map((bonus: any) => (
                  <Card key={bonus.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{bonus.title}</h4>
                            <Badge variant="outline">{bonus.operator.name}</Badge>
                            <Badge variant="secondary">{bonus.productType}</Badge>
                            <Badge variant="outline">Score: {bonus.valueScore}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Max: ${bonus.maxBonus}</span>
                            <span>Min Deposit: ${bonus.minDeposit}</span>
                            <span>Wagering: {bonus.wageringRequirement}x</span>
                            <span>Expires: {bonus.expiryDays}d</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" data-testid={`button-view-${bonus.id}`}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-edit-${bonus.id}`}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-delete-${bonus.id}`}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Scraping Configuration Management</h3>
              <Button 
                onClick={() => setShowConfigForm(true)}
                data-testid="button-add-config"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </div>

            {showConfigForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Scraping Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operatorName">Operator Name</Label>
                      <Input
                        id="operatorName"
                        value={configForm.operatorName}
                        onChange={(e) => setConfigForm({...configForm, operatorName: e.target.value})}
                        placeholder="DraftKings Sportsbook"
                        data-testid="input-operator-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bonusPageUrl">Bonus Page URL</Label>
                      <Input
                        id="bonusPageUrl"
                        value={configForm.bonusPageUrl}
                        onChange={(e) => setConfigForm({...configForm, bonusPageUrl: e.target.value})}
                        placeholder="https://sportsbook.draftkings.com/promos"
                        data-testid="input-bonus-url"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operatorId">Operator ID</Label>
                      <Input
                        id="operatorId"
                        value={configForm.operatorId}
                        onChange={(e) => setConfigForm({...configForm, operatorId: e.target.value})}
                        placeholder="op-2"
                        data-testid="input-operator-id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <Select value={configForm.productType} onValueChange={(value) => setConfigForm({...configForm, productType: value})}>
                        <SelectTrigger data-testid="select-config-product-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sportsbook">Sportsbook</SelectItem>
                          <SelectItem value="casino">Casino</SelectItem>
                          <SelectItem value="poker">Poker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="containerSelector">Container Selector</Label>
                      <Input
                        id="containerSelector"
                        value={configForm.containerSelector}
                        onChange={(e) => setConfigForm({...configForm, containerSelector: e.target.value})}
                        placeholder=".promo-card, .promotion-card"
                        data-testid="input-container-selector"
                      />
                    </div>
                    <div>
                      <Label htmlFor="titleSelector">Title Selector</Label>
                      <Input
                        id="titleSelector"
                        value={configForm.titleSelector}
                        onChange={(e) => setConfigForm({...configForm, titleSelector: e.target.value})}
                        placeholder="h2, h3, .title"
                        data-testid="input-title-selector"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="descriptionSelector">Description Selector</Label>
                      <Input
                        id="descriptionSelector"
                        value={configForm.descriptionSelector}
                        onChange={(e) => setConfigForm({...configForm, descriptionSelector: e.target.value})}
                        placeholder=".description, p"
                        data-testid="input-description-selector"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amountSelector">Amount Selector</Label>
                      <Input
                        id="amountSelector"
                        value={configForm.amountSelector}
                        onChange={(e) => setConfigForm({...configForm, amountSelector: e.target.value})}
                        placeholder=".amount, .bonus-amount"
                        data-testid="input-amount-selector"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wageringSelector">Wagering Selector</Label>
                      <Input
                        id="wageringSelector"
                        value={configForm.wageringSelector}
                        onChange={(e) => setConfigForm({...configForm, wageringSelector: e.target.value})}
                        placeholder=".terms, .wagering"
                        data-testid="input-wagering-selector"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDateSelector">End Date Selector</Label>
                      <Input
                        id="endDateSelector"
                        value={configForm.endDateSelector}
                        onChange={(e) => setConfigForm({...configForm, endDateSelector: e.target.value})}
                        placeholder=".expires, .end-date"
                        data-testid="input-end-date-selector"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="claimLinkSelector">Claim Link Selector</Label>
                    <Input
                      id="claimLinkSelector"
                      value={configForm.claimLinkSelector}
                      onChange={(e) => setConfigForm({...configForm, claimLinkSelector: e.target.value})}
                      placeholder="a[href*='signup'], .cta-button"
                      data-testid="input-claim-link-selector"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/scraping/configs/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              operatorName: configForm.operatorName,
                              operatorId: configForm.operatorId,
                              bonusPageUrl: configForm.bonusPageUrl,
                              productType: configForm.productType,
                              selectors: {
                                containerSelector: configForm.containerSelector,
                                titleSelector: configForm.titleSelector,
                                descriptionSelector: configForm.descriptionSelector,
                                amountSelector: configForm.amountSelector,
                                wageringSelector: configForm.wageringSelector,
                                endDateSelector: configForm.endDateSelector,
                                claimLinkSelector: configForm.claimLinkSelector
                              }
                            })
                          });
                          const result = await response.json();
                          toast({
                            title: result.success ? "Test Successful" : "Test Failed",
                            description: result.message || result.error,
                            variant: result.success ? "default" : "destructive"
                          });
                        } catch (error) {
                          toast({
                            title: "Test Failed",
                            description: "Failed to test configuration",
                            variant: "destructive"
                          });
                        }
                      }}
                      variant="outline"
                      data-testid="button-test-config"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Configuration
                    </Button>
                    <Button 
                      onClick={async (e) => {
                        e.preventDefault();
                        console.log('Save button clicked:', { selectedConfig, configForm });
                        
                        try {
                          const isEditing = selectedConfig !== null;
                          const url = isEditing 
                            ? `/api/admin/scraping/configs/${selectedConfig.operatorId}/${selectedConfig.productType}`
                            : '/api/admin/scraping/configs';
                          const method = isEditing ? 'PUT' : 'POST';
                          
                          console.log('Making request:', { method, url });
                          
                          const requestBody = {
                            operatorName: configForm.operatorName,
                            operatorId: configForm.operatorId || configForm.operatorName.toLowerCase().replace(/\s+/g, '-'),
                            productType: configForm.productType,
                            bonusPageUrl: configForm.bonusPageUrl,
                            loginRequired: configForm.loginRequired,
                            selectors: {
                              containerSelector: configForm.containerSelector,
                              titleSelector: configForm.titleSelector,
                              descriptionSelector: configForm.descriptionSelector,
                              amountSelector: configForm.amountSelector,
                              wageringSelector: configForm.wageringSelector,
                              endDateSelector: configForm.endDateSelector,
                              claimLinkSelector: configForm.claimLinkSelector
                            }
                          };
                          
                          console.log('Request body:', requestBody);
                          
                          const response = await fetch(url, {
                            method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody)
                          });
                          
                          console.log('Response status:', response.status);
                          
                          if (response.ok) {
                            const result = await response.json();
                            console.log('Success result:', result);
                            
                            setShowConfigForm(false);
                            setSelectedConfig(null);
                            setConfigForm({
                              operatorName: '', operatorId: '', productType: 'sportsbook',
                              bonusPageUrl: '', loginRequired: false,
                              containerSelector: '', titleSelector: '', descriptionSelector: '',
                              amountSelector: '', wageringSelector: '', endDateSelector: '', claimLinkSelector: ''
                            });
                            queryClient.invalidateQueries({ queryKey: ['/api/admin/scraping/configs'] });
                            toast({
                              title: isEditing ? "Configuration Updated" : "Configuration Saved",
                              description: `${configForm.operatorName} configuration has been ${isEditing ? 'updated' : 'saved'}`,
                            });
                          } else {
                            const error = await response.json();
                            console.error('API error:', error);
                            toast({
                              title: "Save Failed",
                              description: error.message || error.error || "Failed to save configuration",
                              variant: "destructive"
                            });
                          }
                        } catch (error) {
                          console.error('Save error:', error);
                          toast({
                            title: "Save Failed", 
                            description: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            variant: "destructive"
                          });
                        }
                      }}
                      data-testid="button-save-config"
                    >
                      {selectedConfig ? "Update Configuration" : "Save Configuration"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowConfigForm(false);
                        setSelectedConfig(null);
                        setConfigForm({
                          operatorName: '', operatorId: '', productType: 'sportsbook',
                          bonusPageUrl: '', loginRequired: false,
                          containerSelector: '', titleSelector: '', descriptionSelector: '',
                          amountSelector: '', wageringSelector: '', endDateSelector: '', claimLinkSelector: ''
                        });
                      }}
                      data-testid="button-cancel-config"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {loadingConfigs ? (
                <p>Loading configurations...</p>
              ) : (
                (configsData as any)?.configs?.map((config: any, index: number) => (
                  <Card key={`${config.operatorId}-${config.productType}-${index}`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{config.operatorName}</h4>
                            <Badge variant="outline">{config.productType}</Badge>
                            <Badge variant={config.loginRequired ? "destructive" : "secondary"}>
                              {config.loginRequired ? "Login Required" : "No Login"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{config.bonusPageUrl}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>Last updated: 2 hours ago</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/admin/scraping/configs/test', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(config)
                                });
                                const result = await response.json();
                                toast({
                                  title: result.success ? "Test Successful" : "Test Failed", 
                                  description: result.success 
                                    ? `Found ${result.bonusesFound} bonuses from ${config.operatorName}`
                                    : result.error,
                                  variant: result.success ? "default" : "destructive"
                                });
                              } catch (error) {
                                toast({
                                  title: "Test Failed",
                                  description: `Failed to test ${config.operatorName}`,
                                  variant: "destructive"
                                });
                              }
                            }}
                            data-testid={`button-test-${config.operatorId}-${config.productType}`}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedConfig(config);
                              setConfigForm({
                                operatorName: config.operatorName,
                                operatorId: config.operatorId,
                                productType: config.productType,
                                bonusPageUrl: config.bonusPageUrl,
                                loginRequired: config.loginRequired,
                                containerSelector: config.selectors?.containerSelector || '',
                                titleSelector: config.selectors?.titleSelector || '',
                                descriptionSelector: config.selectors?.descriptionSelector || '',
                                amountSelector: config.selectors?.amountSelector || '',
                                wageringSelector: config.selectors?.wageringSelector || '',
                                endDateSelector: config.selectors?.endDateSelector || '',
                                claimLinkSelector: config.selectors?.claimLinkSelector || ''
                              });
                              setShowConfigForm(true);
                            }}
                            data-testid={`button-edit-${config.operatorId}-${config.productType}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Web Scraping</span>
                    <Badge>Primary</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Entry</span>
                    <Badge variant="secondary">Secondary</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Feeds</span>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freshness</span>
                    <span className="font-medium">6 hours avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage</span>
                    <span className="font-medium">10 operators</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;