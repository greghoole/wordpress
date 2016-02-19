<?php
/*
Description: Embed Analytics Class for use with Embed Analytics graphing
Version: 1.0.0
Author: Gregory Hoole <greg@ultimatenewmedia.com>
*/

// Load the Google API PHP Client Library.
require_once dirname(__FILE__) . '/inc/src/Google/autoload.php';

class EmbedAnalytics 
{
    // google client
    protected $client;

    // google analytics service
    protected $analytics;

    // email address for the service account
    protected $serviceAccountEmailAddress;

    // key file for service account
    protected $serviceAccountKeyFile;

    // client's UA value (used to find profile id)
    protected $clientAnalyticsProperty;

    // generated access token
    protected $accessToken;

    // current client profile id
    protected $profileId;

    public function __construct($emailAddress, $keyFile, $analyticsProperty)
    {
        $this->serviceAccountEmailAddress = $emailAddress;
        $this->serviceAccountKeyFile = $keyFile;
        $this->clientAnalyticsProperty = $analyticsProperty;
    }

    public function get($name)
    {
        return $this->$name;
    }

    public function initialize()
    {
        try {

            $this->setClient();
            $this->setAnalytics();

            $this->setAccessToken();
            $this->setProfileId();
        }
        catch(Exception $e){
            echo $e->getMessage();
        }
    }

    protected function setClient()
    {
        $client = new Google_Client();
        $client->setApplicationName("uConnect Analytics");
        $this->client = $client;
    }

    protected function setAnalytics()
    {
        // Create and configure a new analytics object
        $this->analytics = new Google_Service_Analytics($this->client);

        // Read the generated client_secrets.p12 key.
        $privateKey = file_get_contents($this->serviceAccountKeyFile);
        $credentials = new Google_Auth_AssertionCredentials(
            $this->serviceAccountEmailAddress,
            array(Google_Service_Analytics::ANALYTICS_READONLY),
            $privateKey
        );

        $this->client->setAssertionCredentials($credentials);
        if($this->client->getAuth()->isAccessTokenExpired()) {
            $this->client->getAuth()->refreshTokenWithAssertion($credentials);
        }
    }

    protected function setAccessToken()
    {
        $this->accessToken = json_decode($this->client->getAccessToken())->access_token;
    }

    // profile id is a ga:123456 not the UA-123456-1 value
    protected function setProfileId()
    {
        $propertyId = NULL;

        // Get the list of accounts for the authorized user.
        $availableAccounts = $this->analytics->management_accounts->listManagementAccounts();

        if (count($availableAccounts->getItems()) > 0) {

            // get the accounts
            $availableAccountItems = $availableAccounts->getItems();

            // loop through all accounts
            foreach($availableAccountItems as $account) {

                // current account id
                $accountId = $account->getId();

                // Get the list of properties for the current account
                $accountProperties = $this->analytics->management_webproperties
                                                     ->listManagementWebproperties($accountId);

                if (count($accountProperties->getItems()) > 0) {

                    // get the properties
                    $properties = $accountProperties->getItems();

                    foreach($properties as $property){
                        if($property->getId() == $this->clientAnalyticsProperty){
                            // this is the UA property we are looking for
                            $propertyId = $property->getId();
                        }
                    }

                    if(isset($propertyId)){
                        // Get the list of views (profiles) for the authorized user.
                        $propertyProfiles = $this->analytics->management_profiles
                                                            ->listManagementProfiles($accountId, $propertyId);

                        if (count($propertyProfiles->getItems()) > 0) {
                            $profiles = $propertyProfiles->getItems();

                            // Return the first view (profile) ID.
                            $this->profileId = $profiles[0]->getId();
                        }
                    }
                }
            }
        } else {
            throw new Exception('No accounts found for this user.');
        }
    }
}